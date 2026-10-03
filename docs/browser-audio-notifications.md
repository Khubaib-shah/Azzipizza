# Reliable Sound Notifications in Web Applications

This guide explains how to play a sound for real-time events such as new orders, chat messages, jobs, alarms, or monitoring alerts while respecting browser autoplay rules.

The central rule is simple:

> A web application cannot force audible playback before the user has interacted with the page. It must obtain a user gesture first, use that gesture to unlock audio, and only then play sounds for later events.

This pattern works with React, Vue, Angular, Svelte, or plain JavaScript.

## 1. Why Browsers Block Notification Sounds

Browsers restrict autoplay to prevent pages from unexpectedly playing audio. A call such as `audio.play()` may reject with a `NotAllowedError` when it happens without a permitted user activation.

This commonly happens when:

- A WebSocket or Socket.io event arrives after the page loaded.
- A timer, service worker, or push event tries to play audio.
- Audio is started from `useEffect`, `setTimeout`, or another asynchronous callback.
- The user has never clicked, touched, pressed a key, or otherwise interacted with the page.

The restriction is controlled by the browser and cannot be bypassed with JavaScript. Muted autoplay, changing the volume, or creating multiple audio elements does not grant permission for audible playback.

## 2. The Recommended Architecture

Use four small responsibilities:

1. **Create one audio resource** when the application or notification area starts.
2. **Unlock the resource** from a real user gesture.
3. **Play the resource** when a notification event arrives.
4. **Expose the locked state** so the UI can ask the user to enable sound.

A good lifecycle looks like this:

```text
Page loads
   |
   v
Create/preload Audio object
   |
   v
Wait for click, touch, keydown, or explicit button
   |
   +--> play() succeeds: mark audio as unlocked
   |
   +--> play() rejects: remain locked and show Enable sound UI
   |
Real-time event arrives
   |
   +--> unlocked: play notification sound
   |
   +--> locked: show visual notification and prompt for interaction
```

Keep the audio object in a module singleton, service, context, or equivalent shared store. Do not create a new audio element for every event.

## 3. Framework-Neutral Implementation

Place a sound file such as `notification.wav` or `notification.mp3` in the application public/static directory. Then use a small audio service:

```js
let notificationAudio = null;
let audioUnlocked = false;

export function initializeNotificationAudio(soundUrl) {
  if (!notificationAudio) {
    notificationAudio = new Audio(soundUrl);
    notificationAudio.preload = "auto";
  }

  return notificationAudio;
}

export async function unlockNotificationAudio() {
  if (!notificationAudio) return false;

  try {
    // This call must happen directly inside a user-initiated event handler.
    await notificationAudio.play();
    notificationAudio.pause();
    notificationAudio.currentTime = 0;
    audioUnlocked = true;
    return true;
  } catch (error) {
    audioUnlocked = false;
    console.warn("Notification audio is still blocked", error);
    return false;
  }
}

export async function playNotificationSound() {
  if (!notificationAudio || !audioUnlocked) return false;

  try {
    notificationAudio.currentTime = 0;
    await notificationAudio.play();
    return true;
  } catch (error) {
    // A browser, permission change, or device state can invalidate playback.
    audioUnlocked = false;
    console.warn("Notification sound could not be played", error);
    return false;
  }
}

export function isNotificationAudioUnlocked() {
  return audioUnlocked;
}
```

`play()` returns a Promise. Always handle that Promise. A rejected Promise is the signal that the application should update its state and offer another user action.

## 4. Unlocking Audio After Interaction

Listen for several useful gesture types. Remove the listeners after the first successful unlock:

```js
initializeNotificationAudio("/notification.wav");

async function handleUserInteraction() {
  const unlocked = await unlockNotificationAudio();

  if (unlocked) {
    window.removeEventListener("click", handleUserInteraction);
    window.removeEventListener("keydown", handleUserInteraction);
    window.removeEventListener("touchstart", handleUserInteraction);
  }
}

window.addEventListener("click", handleUserInteraction);
window.addEventListener("keydown", handleUserInteraction);
window.addEventListener("touchstart", handleUserInteraction);
```

An explicit button is usually clearer and more reliable than silently waiting for any click:

```html
<button id="enable-sound" type="button">Enable alert sound</button>
<script type="module">
  const button = document.querySelector("#enable-sound");

  button.addEventListener("click", async () => {
    const unlocked = await unlockNotificationAudio();

    if (unlocked) {
      button.hidden = true;
    }
  });
</script>
```

The `play()` call should remain in the click handler's call chain. Avoid inserting a delayed callback before it:

```js
// Good: play starts from the button event handler.
button.addEventListener("click", () => unlockNotificationAudio());

// Risky: the user activation may no longer be available after the delay.
button.addEventListener("click", () => {
  setTimeout(() => unlockNotificationAudio(), 1000);
});
```

Some browsers allow a click anywhere on the page to unlock audio, but an explicit control gives users a clear explanation and a reliable recovery path.

## 5. React Pattern

Mount the manager in a layout that remains mounted while real-time notifications are active. Do not mount it only on a login page if the notification system starts after navigation.

```jsx
import { useEffect } from "react";
import {
  initializeNotificationAudio,
  unlockNotificationAudio,
} from "./notificationAudio";

export function NotificationAudioManager() {
  useEffect(() => {
    initializeNotificationAudio("/notification.wav");

    const handleInteraction = async () => {
      const unlocked = await unlockNotificationAudio();

      if (unlocked) {
        window.removeEventListener("click", handleInteraction);
        window.removeEventListener("keydown", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  return null;
}
```

For a better product experience, store `isAudioBlocked` or `isAudioUnlocked` in a context/store and render an `Enable sound` button near the notification area. The notification event should still be visible even when sound is unavailable.

## 6. Handling Real-Time Events Correctly

The event handler should treat sound as one part of notification delivery, not as the only part:

```js
socket.on("order:new", async (order) => {
  addNotificationToTheList(order);
  showToast("New order received");

  const played = await playNotificationSound();
  setAudioBlocked(!played);
});
```

Important details:

- Do not discard the notification when sound fails.
- Keep toast, badge, page title, and visual alert behavior independent of audio.
- Reset the audio state if a later user gesture succeeds.
- Do not assume that a previously successful unlock will remain valid forever.
- Avoid allowing several event handlers to fight over the same audio element.

If multiple notifications can arrive quickly, choose an intentional policy:

- Restart the same sound for every event.
- Queue sounds and play them one after another.
- Coalesce events and play once for a batch.
- Rate-limit sounds while retaining every visual notification.

For most dashboards, restarting or rate-limiting a short alert sound is preferable to a long queue.

## 7. Cross-Tab Coordination

If the same application can be open in several tabs, every tab may receive the same server event. Without coordination, one event can produce several sounds.

A simple short-lived timestamp lock uses `localStorage`:

```js
const SOUND_LOCK_KEY = "notification_sound_last_played";
const SOUND_LOCK_MS = 2000;

export function shouldPlayInThisTab() {
  const now = Date.now();
  const lastPlayed = Number(localStorage.getItem(SOUND_LOCK_KEY) || 0);

  if (now - lastPlayed < SOUND_LOCK_MS) {
    return false;
  }

  localStorage.setItem(SOUND_LOCK_KEY, String(now));
  return true;
}
```

Use it immediately before playback:

```js
if (shouldPlayInThisTab()) {
  await playNotificationSound();
}
```

This is a best-effort coordination mechanism, not a distributed lock. For stronger behavior, use `BroadcastChannel` to announce the event and designate one active tab, for example the visible tab. Remember that `BroadcastChannel` coordinates application messages; it does not bypass autoplay restrictions.

Also consider coordinating toast messages separately from sounds. A user may want a toast in the active tab even when another tab owns the sound.

## 8. What to Do When Audio Is Blocked

A robust fallback has three layers:

1. **Visual notification:** badge, toast, banner, changed document title, or highlighted row.
2. **Actionable recovery:** an `Enable alert sound` button that calls `unlockNotificationAudio()`.
3. **Persistent preference/state:** once enabled, remember the user's preference where appropriate, but still verify playback because browser/device state can change.

Example UI state:

```jsx
{isAudioBlocked && (
  <button type="button" onClick={enableSound}>
    Enable alert sound
  </button>
)}
```

Do not repeatedly call `play()` from timers while blocked. That creates rejected Promises and noisy console output without solving the permission problem.

## 9. Browser and Device Limitations

The approach improves reliability but cannot guarantee sound in every situation:

- The browser may block playback until a gesture occurs.
- The operating system may be muted or in a focus/do-not-disturb mode.
- The tab may be backgrounded or suspended.
- The device may have no audio output.
- Mobile browsers may apply stricter gesture rules.
- A user can revoke site permissions or change media settings.
- An inactive or closed page cannot reliably play an HTML audio element.

If the user must be notified while the page is closed or suspended, use the Notifications API and Push API with a service worker. Request notification permission from an explicit user action and configure the push notification payload with a system notification sound where the platform supports it. This is a separate capability from in-page audio and has its own permission model.

## 10. Common Mistakes

### Treating `play()` as synchronous

Incorrect:

```js
notificationAudio.play();
setAudioEnabled(true);
```

Correct:

```js
try {
  await notificationAudio.play();
  setAudioEnabled(true);
} catch {
  setAudioEnabled(false);
}
```

### Swallowing playback errors

If the audio helper catches an error and returns nothing, its caller may believe playback succeeded. Return a Boolean or rethrow the error consistently.

### Unlocking the wrong audio element

The element primed by the user gesture must be the same shared element later used for notification playback. Do not create a new `Audio` instance inside the socket event handler.

### Mounting the manager too late

If the manager is mounted only after a route transition, the interaction that caused the transition may not be observed. Mount it in the authenticated application layout or use an explicit enable button after navigation.

### Assuming the first click always succeeds

A click can still fail because the audio URL is missing, the file is unsupported, the request failed, or the device is muted. Check the Promise result and show the fallback state.

### Confusing browser audio permission with web notification permission

`HTMLAudioElement.play()` and `Notification.requestPermission()` are different permission flows. One does not grant the other.

## 11. Testing Checklist

Test the following scenarios in the browsers and devices your users actually use:

- Load the page and wait for a real-time event without interacting. Confirm there is a visual notification and no unhandled Promise rejection.
- Click `Enable alert sound`, then trigger an event. Confirm the sound plays.
- Try keyboard and touch interaction if those are supported unlock paths.
- Refresh the page and verify the state is rebuilt correctly.
- Open two tabs and trigger one event. Confirm the sound is not duplicated unexpectedly.
- Trigger several events quickly and verify the chosen rate-limit or queue policy.
- Test a missing or unsupported sound file.
- Test with the operating system muted and with browser site sound disabled.
- Navigate between routes and confirm the audio manager is not initialized repeatedly.
- Test a background tab and a closed/suspended page separately. Use Push Notifications for the latter requirement.

A useful manual test is to watch the browser console for `NotAllowedError`, `AbortError`, failed asset requests, and unhandled Promise rejections.

## 12. Applying This to Azzipizza

The current Azzipizza implementation follows the right high-level design:

- [AudioManager.jsx](../src/apps/admin/components/AudioManager.jsx) creates and primes one shared audio instance after a click.
- [AdminSocketContext.jsx](../src/apps/admin/context/AdminSocketContext.jsx) requests playback when `order:new` arrives.
- [notification-utils.js](../src/shared/utils/notification-utils.js) rate-limits sound and toast activity across tabs with `localStorage`.
- [AdminLayout.jsx](../src/apps/admin/components/AdminLayout.jsx) mounts the audio manager for authenticated admin routes.

Before copying the implementation to another application, make these improvements:

1. Make `playNotificationSound()` return `true` on success and `false` on failure, or rethrow its error. The current helper catches the error internally, so the caller cannot reliably set its blocked state.
2. Add an explicit `Enable alert sound` button after login. The current manager does not mount on the login route, so the login click cannot prime the admin audio instance.
3. Listen to `keydown` and `touchstart` as well as `click`, or use the explicit button as the primary path.
4. Keep visual notifications working when audio is blocked.
5. Keep audio initialization and playback on the same shared `Audio` instance.

The reusable principle is: **initialize early, unlock from a user gesture, handle the Promise, report failure, and preserve a visual fallback.**
