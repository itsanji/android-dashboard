package expo.modules.mediasession

import android.service.notification.NotificationListenerService

/**
 * Intentionally empty. Android only returns other apps' media sessions to
 * apps that have an enabled notification listener, so this service exists
 * purely to hold that permission; notifications themselves are ignored.
 */
class MediaListenerService : NotificationListenerService()
