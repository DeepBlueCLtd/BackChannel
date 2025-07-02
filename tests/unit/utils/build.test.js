import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('BackChannel build process', () => {
  // Use a relative path approach instead
  const distPath = path.resolve('dist')
  const pluginPath = path.join(distPath, 'backchannel.js')
  const mapPath = path.join(distPath, 'backchannel.js.map')

  test('dist directory exists', () => {
    expect(fs.existsSync(distPath)).toBe(true)
  })

  test('backchannel.js file exists', () => {
    expect(fs.existsSync(pluginPath)).toBe(true)
  })

  test('source map file exists', () => {
    expect(fs.existsSync(mapPath)).toBe(true)
  })

  test('backchannel.js contains expected content', () => {
    const content = fs.readFileSync(pluginPath, 'utf-8')
    
    // Check for IIFE format - the actual format is 'this.BackChannel = function()'
    expect(content).toMatch(/this\.BackChannel = function/)
    
    // Check for init function
    expect(content).toMatch(/init:/)
    
    // Check for source map reference
    expect(content).toMatch(/\/\/# sourceMappingURL=backchannel\.js\.map/)
  })
})
