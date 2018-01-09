#!/usr/bin/env node
const tplchange = require('..')
const path = process.argv[2]
const type = process.argv[3]
new tplchange().SmToNj(path, type)