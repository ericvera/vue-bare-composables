import { expect, it } from 'vitest'
import { deepEqual } from './deepEqual.js'

it('should return true for identical primitives', () => {
  expect(deepEqual(1, 1)).toBe(true)
  expect(deepEqual('a', 'a')).toBe(true)
  expect(deepEqual(true, true)).toBe(true)
  expect(deepEqual(false, false)).toBe(true)
})

it('should return false for different primitives', () => {
  expect(deepEqual(1, 2)).toBe(false)
  expect(deepEqual('a', 'b')).toBe(false)
  expect(deepEqual(true, false)).toBe(false)
  expect(deepEqual(1, '1')).toBe(false)
})

it('should return true for null', () => {
  expect(deepEqual(null, null)).toBe(true)
})

it('should return false when one is null', () => {
  expect(deepEqual(null, {})).toBe(false)
  expect(deepEqual(0, null)).toBe(false)
  expect(deepEqual('', null)).toBe(false)
})

it('should return true for NaN', () => {
  expect(deepEqual(Number.NaN, Number.NaN)).toBe(true)
})

it('should return false when comparing NaN to other values', () => {
  expect(deepEqual(Number.NaN, 0)).toBe(false)
  expect(deepEqual(Number.NaN, null)).toBe(false)
})

it('should compare Date by timestamp', () => {
  const d = new Date('2024-01-15T12:00:00.000Z')
  const same = new Date('2024-01-15T12:00:00.000Z')
  const different = new Date('2024-01-15T13:00:00.000Z')
  expect(deepEqual(d, same)).toBe(true)
  expect(deepEqual(d, different)).toBe(false)
})

it('should compare arrays by content and order', () => {
  expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
  expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
  expect(deepEqual([1, 2, 3], [1, 2])).toBe(false)
  expect(deepEqual([1, 2], [2, 1])).toBe(false)
})

it('should compare objects regardless of property order', () => {
  expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  expect(deepEqual({ x: 'x', y: 'y' }, { y: 'y', x: 'x' })).toBe(true)
})

it('should treat undefined and missing key as equivalent', () => {
  expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(true)
  expect(deepEqual({ a: 1, b: undefined }, { a: 1 })).toBe(true)
  expect(deepEqual({}, { a: undefined })).toBe(true)
})

it('should compare nested structures', () => {
  expect(deepEqual({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true)
  expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false)
  expect(deepEqual({ items: [1, 2, 3] }, { items: [1, 2, 3] })).toBe(true)
})

it('should return false for objects with different keys', () => {
  expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
})

it('should return true for empty objects and arrays', () => {
  expect(deepEqual({}, {})).toBe(true)
  expect(deepEqual([], [])).toBe(true)
})
