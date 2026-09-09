const mockLoadURL = jest.fn()
const mockLoadFile = jest.fn()
const mockOn = jest.fn()
const mockQuit = jest.fn()

const mockBrowserWindowInstance = {
  loadURL: mockLoadURL,
  loadFile: mockLoadFile,
  on: mockOn,
}

const BrowserWindow = jest.fn(() => mockBrowserWindowInstance)
BrowserWindow.getAllWindows = jest.fn(() => [])

const mockWhenReady = jest.fn()

const app = {
  whenReady: mockWhenReady,
  on: jest.fn(),
  quit: mockQuit,
}

module.exports = { app, BrowserWindow }
