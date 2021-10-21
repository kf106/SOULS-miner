const keccak256 = require('js-sha3').keccak256;
const fs = require('fs');

// xor two buffers (why is this not built in?)
function xor (buf1, buf2) {
  return buf1.map((b, i) => b ^ buf2[i]);
}

// reverse pairs of octets because endianism is broken
function swap (bytes) {
  const str = bytes.toString('hex');
  let spellStore = '';
  for (let i = 0; i < 64; i = i + 2) {
    const char1 = str.charAt(i);
    const char2 = str.charAt(i + 1);
    spellStore = spellStore + char2 + char1;
  }
  return Buffer.from(spellStore, 'hex');
}

// finds the bit at a given position in a byte
function getBit (bitIndex, buf) {
  const byte = ~~(bitIndex / 8);
  const bit = bitIndex % 8;
  const idByte = buf[byte];
  const result = (idByte & Math.pow(2, (7 - bit)));
  return result;
}

// loops through bits in a byte32 counting the number of leading bits
function clo (target) {
  let i = 0;
  for (i; i < 256; i++) {
    if (getBit((255 - i), target) === 0) {
      // console.log(i);
      return i;
    }
  }
  return i;
}

function mine (soul, incantation) {
  const incantationBytes = Buffer.from(incantation, 'hex');
  const soulBytes = Buffer.from(soul.replace(/0x/g, ''), 'hex');
  const spellStore = swap(keccak256(incantationBytes).toString('hex'));
  const spellBytes = Buffer.from(spellStore, 'hex');
  const result = clo(swap(xor(spellBytes, soulBytes)));
  return result;
}

console.log('Starting mining');
arg1 = process.argv[2];
arg2 = process.argv[3];

console.log('Usage: node mine.js <soul> <starting point>');
console.log('If no arguments are provided, this miner will mine SOUL #1');

let soul = '951503ab956ad15f4006d702f5d40cc329e93a14f2df6a6b179e4c807cf20029';
if ((arg1) && (arg1.length === 64)) {
  let re = new RegExp('/[0-9A-Fa-f]{64}/g');
  if (re.test(arg1)) { soul = arg1 }
}

let start = 0;
if (arg2) {
  start = parseInt(arg2);
}

console.log('Mining: ' + soul);
fs.appendFileSync('./results.txt', '\nMining: ' + soul, err => {
  if (err) {
    console.error(err)
  }
});

var mineNFT = function () {
  let bestResult = 0;
  let bestIncantation = 0;
  for (let i = start; i < 2**256; i++) {
    if ((i % 1000000) === 0) { 
      process.stdout.write('\r' + i.toString()); 
    }
    const rndHx = i.toString(16).padStart(64,"0");
    const result = mine(soul, rndHx);
    if (result > bestResult) {
      bestResult = result;
      bestIncantation = rndHx;
      const resultOutput = '\nMined ' + bestIncantation + ' which would give level ' + bestResult;
      console.log(resultOutput);
      fs.appendFileSync('./results.txt', resultOutput, err => {
        if (err) {
          console.error(err)
        }
      });
    }
  }
}

mineNFT();
