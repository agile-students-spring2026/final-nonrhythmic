const { expect } = require('chai')
const {
  parseRentUsd,
  normalizeRating,
  mapQueryForLocation,
} = require('../lib/listingHelpers')

describe('listingHelpers', () => {
  describe('parseRentUsd', () => {
    it('parses mo-style price', () => {
      expect(parseRentUsd('$1,200/mo')).to.equal(1200)
    })

    it('parses month-style price', () => {
      expect(parseRentUsd('$900/month')).to.equal(900)
    })

    it('returns 0 when no digits', () => {
      expect(parseRentUsd('free')).to.equal(0)
    })
  })

  describe('normalizeRating', () => {
    it('formats a finite number', () => {
      expect(normalizeRating(4)).to.equal('4.0')
      expect(normalizeRating(4.25)).to.equal('4.3')
    })

    it('coerces numeric strings', () => {
      expect(normalizeRating('3.5')).to.equal('3.5')
    })

    it('defaults when not numeric', () => {
      expect(normalizeRating('x')).to.equal('4.0')
    })
  })

  describe('mapQueryForLocation', () => {
    it('handles Jersey City', () => {
      expect(mapQueryForLocation('  Jersey City  ')).to.equal('Jersey City, NJ')
    })

    it('preserves comma addresses', () => {
      expect(mapQueryForLocation('Astoria, NY')).to.equal('Astoria, NY')
    })

    it('appends New York for simple strings', () => {
      expect(mapQueryForLocation('Brooklyn')).to.equal('Brooklyn, New York, NY')
    })
  })
})
