export async function generateFingerprint(): Promise<string> {
  const components: Record<string, any> = {};

  components.userAgent = navigator.userAgent;
  components.language = navigator.language;
  components.languages = JSON.stringify(navigator.languages);
  components.platform = navigator.platform;
  components.doNotTrack = navigator.doNotTrack;
  components.cookieEnabled = navigator.cookieEnabled;

  components.screenWidth = window.screen.width;
  components.screenHeight = window.screen.height;
  components.screenDepth = window.screen.colorDepth;
  components.screenAvailWidth = window.screen.availWidth;
  components.screenAvailHeight = window.screen.availHeight;
  components.devicePixelRatio = window.devicePixelRatio;

  components.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  components.timezoneOffset = new Date().getTimezoneOffset();

  components.localStorage = !!window.localStorage;
  components.sessionStorage = !!window.sessionStorage;
  components.indexedDB = !!window.indexedDB;

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;

      const gradient = ctx.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, "red");
      gradient.addColorStop(0.5, "green");
      gradient.addColorStop(1.0, "blue");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 200, 50);

      ctx.fillStyle = "#000000";
      ctx.font = "18px Arial";
      ctx.fillText("Fingerprint", 10, 30);

      components.canvasFingerprint = canvas.toDataURL();
    }
  } catch (e) {
    components.canvasFingerprint = "canvas-not-supported";
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (gl) {
      components.webglVendor = gl.getParameter(gl.VENDOR);
      components.webglRenderer = gl.getParameter(gl.RENDERER);

      const extensions = gl.getSupportedExtensions();
      if (extensions) {
        components.webglExtensions = extensions.join(",");
      }
    }
  } catch (e) {
    components.webglFingerprint = "webgl-not-supported";
  }

  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    components.audioContextSampleRate = audioContext.sampleRate;
    components.audioContextState = audioContext.state;
    components.audioContextMaxChannelCount =
      audioContext.destination.maxChannelCount;

    audioContext.close();
  } catch (e) {
    components.audioFingerprint = "audio-not-supported";
  }

  try {
    const pluginsArray = Array.from(navigator.plugins || []);
    const pluginsInfo = pluginsArray.map((plugin) => {
      return {
        name: plugin.name,
        description: plugin.description,
        filename: plugin.filename,
      };
    });
    components.plugins = JSON.stringify(pluginsInfo);
  } catch (e) {
    components.plugins = "plugins-not-available";
  }

  const fontList = [
    "Arial",
    "Courier New",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Helvetica",
    "Tahoma",
    "Impact",
  ];

  try {
    const fontDetectionDiv = document.createElement("div");
    fontDetectionDiv.style.visibility = "hidden";
    fontDetectionDiv.style.position = "absolute";
    document.body.appendChild(fontDetectionDiv);

    const detectFont = (font: string): boolean => {
      const baseFont = "monospace";
      const testString = "mmmmmmmmmmlli";
      const baseSize = 72;

      fontDetectionDiv.style.fontFamily = baseFont;
      fontDetectionDiv.textContent = testString;
      const baseWidth = fontDetectionDiv.offsetWidth;

      fontDetectionDiv.style.fontFamily = `${font}, ${baseFont}`;
      return fontDetectionDiv.offsetWidth !== baseWidth;
    };

    const detectedFonts = fontList.filter((font) => detectFont(font));
    components.fonts = detectedFonts.join(",");
    document.body.removeChild(fontDetectionDiv);
  } catch (e) {
    components.fonts = "font-detection-failed";
  }

  const fingerprintData = Object.entries(components)
    .map(([key, value]) => `${key}:${String(value)}`)
    .join("|");

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < fingerprintData.length; i++) {
      const char = fingerprintData.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

export async function getFingerprint(): Promise<string> {
  try {
    const storedFingerprint = localStorage.getItem("device_fingerprint");

    if (storedFingerprint) {
      return storedFingerprint;
    }

    const fingerprint = await generateFingerprint();

    localStorage.setItem("device_fingerprint", fingerprint);

    return fingerprint;
  } catch (e) {
    return generateFingerprint();
  }
}
