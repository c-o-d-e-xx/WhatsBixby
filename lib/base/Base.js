/* Copyright (C) 2025 Codex.
Licensed under the MIT License;
you may not use this file except in compliance with the License.
Codex - Ziyan
*/

"use strict";
class Base {
  constructor(client, msg) {
    Object.defineProperty(this, "client", { value: client });
    Object.defineProperty(this, "m", { value: msg });
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data) {
    return data;
  }
}

module.exports =Base