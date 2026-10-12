const MESSAGES = {
  1: "Location permission is blocked. Allow it in your browser settings to report.",
  2: "Couldn't determine your location. Try again with GPS on.",
  3: "Getting your location timed out. Try again.",
};

// Asked only when the user reports (and while background sync runs), never for plain tracking.
export function getPosition() {
  return new Promise((resolve, reject) => {
    const fail = (message, code) => reject(Object.assign(new Error(message), { code }));

    if (!("geolocation" in navigator)) return fail("Location isn't supported on this device.", 0);
    if (!window.isSecureContext) {
      return fail("Location only works on HTTPS or localhost. Open the app over HTTPS.", 1);
    }

    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: p.coords.accuracy }),
      (err) => fail(MESSAGES[err.code] || "Couldn't get your location.", err.code),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  });
}