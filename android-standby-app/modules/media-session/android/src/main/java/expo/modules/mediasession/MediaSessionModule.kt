package expo.modules.mediasession

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * JS bridge for [NowPlayingController]. Emits [STATE_EVENT] while JS has
 * listeners attached; see modules/media-session/index.ts for the JS API.
 */
class MediaSessionModule : Module() {
  private var controller: NowPlayingController? = null

  private fun requireController(): NowPlayingController =
    controller ?: throw IllegalStateException("MediaSession module is not initialized")

  override fun definition() = ModuleDefinition {
    Name("MediaSession")

    Events(STATE_EVENT)

    OnCreate {
      val context = requireNotNull(appContext.reactContext) { "React context is not available" }
      controller = NowPlayingController(context.applicationContext) { state ->
        sendEvent(STATE_EVENT, state)
      }
    }

    OnStartObserving { controller?.start() }

    OnStopObserving { controller?.stop() }

    // The user may have just granted notification access in Settings
    OnActivityEntersForeground { controller?.refresh() }

    OnDestroy {
      controller?.stop()
      controller = null
    }

    Function("hasPermission") { requireController().hasPermission() }

    Function("openPermissionSettings") { requireController().openPermissionSettings() }

    Function("getState") { requireController().getState() }

    Function("play") { requireController().play() }

    Function("pause") { requireController().pause() }

    Function("togglePlayPause") { requireController().togglePlayPause() }

    Function("skipToNext") { requireController().skipToNext() }

    Function("skipToPrevious") { requireController().skipToPrevious() }

    Function("seekTo") { positionMs: Double -> requireController().seekTo(positionMs.toLong()) }
  }

  companion object {
    const val STATE_EVENT = "onStateChange"
  }
}
