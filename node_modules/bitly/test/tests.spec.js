'use strict';

import Bitly from '../src/bitly';
import { expect } from 'chai';
import 'sepia';

describe('node-bitly tests', () => {

  let bitly;
  let bitly_token = 'eb1b99efe83c7d029e7600a6b38e32d1c9c2c6d9';
  const LONG_URL = 'http://example.com';
  const SHORT_URL = 'http://bit.ly/1KjIwXl';
  const BITLY_HASH = 'VDcn';

  beforeEach(() => {
    bitly = new Bitly(bitly_token);
  });

  afterEach(() => {
    bitly = undefined;
  });

  describe('module instantiation', () => {
    it('should be a valid object with configuration and methods', () => {
      expect(bitly.config).to.be.an('object');
      expect(bitly.config).to.have.property('access_token').and.to.equal(bitly_token);
    });
  });

  describe('shorten url', () => {
    it('should return a success', (done) => {
      bitly.shorten(LONG_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Check info on bitly pro-domain', () => {
    it('should return a success', (done) => {
      bitly.bitlyProDomain('nyti.ms').then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Get info about domain or hash', () => {
    it('should return a success for a short url', (done) => {
      bitly.info(SHORT_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash', (done) => {
      bitly.info(BITLY_HASH).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash and short url mixed', (done) => {
      bitly.info([SHORT_URL, BITLY_HASH]).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Get info on click', () => {
    it('should return a success for a short url', (done) => {
      bitly.clicks(SHORT_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash', (done) => {
      bitly.clicks(BITLY_HASH).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash and short url mixed', (done) => {
      bitly.clicks([SHORT_URL, BITLY_HASH]).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Get info on clicks by minute', () => {
    it('should return a success for a short url', (done) => {
      bitly.clicksByMinute(SHORT_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash', (done) => {
      bitly.clicksByMinute(BITLY_HASH).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash and short url mixed', (done) => {
      bitly.clicksByMinute([SHORT_URL, BITLY_HASH]).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Get info on clicks by day', () => {
    it('should return a success for a short url', (done) => {
      bitly.clicksByDay(SHORT_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash', (done) => {
      bitly.clicksByDay(BITLY_HASH).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash and short url mixed', (done) => {
      bitly.clicksByDay([SHORT_URL, BITLY_HASH]).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Get referrers', () => {
    it('should return a success for a short url', (done) => {
      bitly.referrers(SHORT_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash', (done) => {
      bitly.referrers(BITLY_HASH).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Get countries', () => {
    it('should return a success for a short url', (done) => {
      bitly.countries(SHORT_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash', (done) => {
      bitly.countries(BITLY_HASH).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Get information about a URL', () => {
    it('should return a success for 1', (done) => {
      bitly.lookup(LONG_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for multiple urls', (done) => {
      bitly.lookup([LONG_URL, 'http://nodejs.org']).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

  describe('Expand URLs', () => {
    it('should return a success for a short url', (done) => {
      bitly.expand(SHORT_URL).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash', (done) => {
      bitly.expand(BITLY_HASH).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });

    it('should return a success for a hash and short url mixed', (done) => {
      bitly.expand([SHORT_URL, BITLY_HASH]).then((result) => {
        expect(result).to.have.property('status_code').and.to.equal(200);
        done();
      }, done);
    });
  });

});
