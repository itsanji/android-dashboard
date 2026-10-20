package expo.modules.mediasession

import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.Settings
import android.util.Log
import java.io.File
import java.io.FileOutputStream

/**
 * Reads and controls the media session of whichever app is currently playing
 * (Spotify, YouTube Music, ...).
 *
 * Requires the user to enable notification access for [MediaListenerService].
 * All observer bookkeeping happens on the main thread; the public read and
 * transport methods query the system fresh and are safe from any thread.
 */
class NowPlayingController(
  private val context: Context,
  private val onStateChange: (Map<String, Any?>) -> Unit
) {
  private val sessionManager =
    context.getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
  private val listenerComponent = ComponentName(context, MediaListenerService::class.java)
  private val mainHandler = Handler(Looper.getMainLooper())

  // Main-thread state
  private var observing = false
  private var sessionsListenerRegistered = false
  private var observedController: MediaController? = null

  // Artwork cache, see [artworkUri]
  private var artworkKey: String? = null
  private var artworkFile: File? = null

  private val sessionsListener =
    MediaSessionManager.OnActiveSessionsChangedListener { controllers ->
      observe(pickController(controllers.orEmpty()))
      emitState()
    }

  private val controllerCallback = object : MediaController.Callback() {
    override fun onMetadataChanged(metadata: MediaMetadata?) = emitState()

    override fun onPlaybackStateChanged(state: PlaybackState?) = emitState()

    override fun onSessionDestroyed() {
      observe(pickController(activeSessions()))
      emitState()
    }
  }

  // region Permission

  fun hasPermission(): Boolean {
    val enabled = Settings.Secure.getString(context.contentResolver, ENABLED_LISTENERS_SETTING)
      ?: return false
    return enabled.split(':').any { ComponentName.unflattenFromString(it) == listenerComponent }
  }

  /** Opens the system screen where the user enables notification access for this app. */
  fun openPermissionSettings() {
    val detail = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      // Goes straight to this app's toggle instead of the full list
      Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS)
        .putExtra(
          Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME,
          listenerComponent.flattenToString()
        )
    } else {
      null
    }
    val list = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)

    for (intent in listOfNotNull(detail, list)) {
      try {
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        return
      } catch (e: ActivityNotFoundException) {
        // Some OEM builds lack the detail screen; fall back to the list
      }
    }
  }

  // endregion

  // region Observing

  fun start() {
    mainHandler.post {
      observing = true
      syncObservers()
      emitState()
    }
  }

  fun stop() {
    mainHandler.post {
      observing = false
      unregisterSessionsListener()
      observe(null)
    }
  }

  /** Re-checks the permission (e.g. after returning from Settings) and pushes the current state. */
  fun refresh() {
    mainHandler.post {
      if (observing) {
        syncObservers()
        emitState()
      }
    }
  }

  private fun syncObservers() {
    if (!hasPermission()) {
      unregisterSessionsListener()
      observe(null)
      return
    }
    if (!sessionsListenerRegistered) {
      try {
        sessionManager.addOnActiveSessionsChangedListener(
          sessionsListener,
          listenerComponent,
          mainHandler
        )
        sessionsListenerRegistered = true
      } catch (e: SecurityException) {
        Log.w(TAG, "Notification access not granted", e)
      }
    }
    observe(pickController(activeSessions()))
  }

  private fun unregisterSessionsListener() {
    if (sessionsListenerRegistered) {
      sessionManager.removeOnActiveSessionsChangedListener(sessionsListener)
      sessionsListenerRegistered = false
    }
  }

  /** Moves the metadata/playback callback to [controller]. */
  private fun observe(controller: MediaController?) {
    if (controller?.sessionToken == observedController?.sessionToken) return
    observedController?.unregisterCallback(controllerCallback)
    observedController = controller
    controller?.registerCallback(controllerCallback, mainHandler)
  }

  private fun emitState() {
    if (observing) onStateChange(getState())
  }

  // endregion

  // region Reading state

  fun getState(): Map<String, Any?> = mapOf(
    "hasPermission" to hasPermission(),
    "nowPlaying" to currentController()?.let(::describe)
  )

  private fun activeSessions(): List<MediaController> = try {
    sessionManager.getActiveSessions(listenerComponent)
  } catch (e: SecurityException) {
    emptyList()
  }

  private fun currentController(): MediaController? = pickController(activeSessions())

  /** Sessions come ordered by priority; prefer one that is actually playing. */
  private fun pickController(controllers: List<MediaController>): MediaController? =
    controllers.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING }
      ?: controllers.firstOrNull { it.metadata != null }

  private fun describe(controller: MediaController): Map<String, Any?> {
    val metadata = controller.metadata
    val playback = controller.playbackState
    val actions = playback?.actions ?: 0L
    val duration = metadata?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0L

    return mapOf(
      "packageName" to controller.packageName,
      "appName" to appName(controller.packageName),
      "title" to metadata?.text(MediaMetadata.METADATA_KEY_TITLE, MediaMetadata.METADATA_KEY_DISPLAY_TITLE),
      "artist" to metadata?.text(
        MediaMetadata.METADATA_KEY_ARTIST,
        MediaMetadata.METADATA_KEY_ALBUM_ARTIST,
        MediaMetadata.METADATA_KEY_DISPLAY_SUBTITLE
      ),
      "album" to metadata?.text(MediaMetadata.METADATA_KEY_ALBUM),
      "artworkUri" to metadata?.let { artworkUri(controller.packageName, it) },
      "durationMs" to duration.takeIf { it > 0 }?.toDouble(),
      "positionMs" to playback?.let(::currentPosition)?.toDouble(),
      "playbackSpeed" to (playback?.playbackSpeed ?: 1f).toDouble(),
      "isPlaying" to (playback?.state == PlaybackState.STATE_PLAYING),
      "isBuffering" to (playback?.state == PlaybackState.STATE_BUFFERING),
      "canSkipNext" to (actions and PlaybackState.ACTION_SKIP_TO_NEXT != 0L),
      "canSkipPrevious" to (actions and PlaybackState.ACTION_SKIP_TO_PREVIOUS != 0L),
      "canSeek" to (actions and PlaybackState.ACTION_SEEK_TO != 0L)
    )
  }

  /** PlaybackState.position is a snapshot; extrapolate it to now while playing. */
  private fun currentPosition(state: PlaybackState): Long {
    if (state.position < 0) return 0
    if (state.state != PlaybackState.STATE_PLAYING) return state.position
    val elapsed = SystemClock.elapsedRealtime() - state.lastPositionUpdateTime
    return state.position + (elapsed * state.playbackSpeed).toLong()
  }

  private fun MediaMetadata.text(vararg keys: String): String? =
    keys.firstNotNullOfOrNull { key -> getText(key)?.toString()?.takeIf { it.isNotBlank() } }

  private fun appName(packageName: String): String = try {
    val pm = context.packageManager
    pm.getApplicationLabel(pm.getApplicationInfo(packageName, 0)).toString()
  } catch (e: PackageManager.NameNotFoundException) {
    packageName
  }

  /**
   * Album art arrives as a Bitmap. React Native can't take a Bitmap directly,
   * so it is written to the cache directory and returned as a file:// URI.
   * The file is reused while the track stays the same.
   */
  @Synchronized
  private fun artworkUri(packageName: String, metadata: MediaMetadata): String? {
    val bitmap = metadata.getBitmap(MediaMetadata.METADATA_KEY_ART)
      ?: metadata.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART)
      ?: return null

    val key = listOf(
      packageName,
      metadata.text(MediaMetadata.METADATA_KEY_TITLE),
      metadata.text(MediaMetadata.METADATA_KEY_ARTIST),
      metadata.text(MediaMetadata.METADATA_KEY_ALBUM),
      "${bitmap.width}x${bitmap.height}"
    ).joinToString("|")

    val cached = artworkFile
    if (key == artworkKey && cached != null && cached.exists()) {
      return Uri.fromFile(cached).toString()
    }

    return try {
      val dir = File(context.cacheDir, "media-session").apply { mkdirs() }
      // Unique name per track so React Native's image cache doesn't show stale art
      val file = File(dir, "art_${Integer.toHexString(key.hashCode())}.jpg")
      FileOutputStream(file).use { out ->
        scaleDown(bitmap).compress(Bitmap.CompressFormat.JPEG, 90, out)
      }
      if (cached != null && cached != file) cached.delete()
      artworkKey = key
      artworkFile = file
      Uri.fromFile(file).toString()
    } catch (e: Exception) {
      Log.w(TAG, "Failed to write artwork", e)
      null
    }
  }

  private fun scaleDown(bitmap: Bitmap): Bitmap {
    val longest = maxOf(bitmap.width, bitmap.height)
    if (longest <= MAX_ARTWORK_SIZE) return bitmap
    val scale = MAX_ARTWORK_SIZE.toFloat() / longest
    return Bitmap.createScaledBitmap(
      bitmap,
      (bitmap.width * scale).toInt(),
      (bitmap.height * scale).toInt(),
      true
    )
  }

  // endregion

  // region Transport controls

  fun play() {
    currentController()?.transportControls?.play()
  }

  fun pause() {
    currentController()?.transportControls?.pause()
  }

  fun togglePlayPause() {
    val controller = currentController() ?: return
    if (controller.playbackState?.state == PlaybackState.STATE_PLAYING) {
      controller.transportControls.pause()
    } else {
      controller.transportControls.play()
    }
  }

  fun skipToNext() {
    currentController()?.transportControls?.skipToNext()
  }

  fun skipToPrevious() {
    currentController()?.transportControls?.skipToPrevious()
  }

  fun seekTo(positionMs: Long) {
    currentController()?.transportControls?.seekTo(positionMs)
  }

  // endregion

  companion object {
    private const val TAG = "NowPlayingController"
    private const val ENABLED_LISTENERS_SETTING = "enabled_notification_listeners"
    private const val MAX_ARTWORK_SIZE = 512
  }
}
