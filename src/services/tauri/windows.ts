export async function createMainWindow() {
  const { WebviewWindow, appWindow } = await import('@tauri-apps/api/window')
  const animaWindow = new WebviewWindow('anima', {
    fullscreen: false,
    height: 900,
    width: 1600,
    minWidth: 1360,
    minHeight: 760,
    resizable: true,
    title: 'Λ ＮＩＭ Λ - App',
    visible: true,
    transparent: true,
    decorations: false,
  })
  animaWindow.once('tauri://created', () => {
    // invoke('close_splashscreen')
    appWindow.close()
  })
  animaWindow.once('tauri://error', () => {
    // TODO: Global error handler
  })
}

export async function createSplashScreen() {
  const { WebviewWindow, appWindow } = await import('@tauri-apps/api/window')
  const splashWindow = new WebviewWindow('main', {
    fullscreen: false,
    minWidth: 1100,
    minHeight: 500,
    resizable: true,
    url: '/splashscreen',
    title: 'Λ ＮＩＭ Λ',
    visible: true,
    transparent: true,
    decorations: false,
  })
  splashWindow.once('tauri://created', () => {
    // invoke('close_splashscreen')
    appWindow.close()
  })
  splashWindow.once('tauri://error', () => {
    // TODO: Global error handler
  })
}
