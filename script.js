var fs = require('fs');
var hexParse = require('./intel-hex');
var hex;
var firmwareStartAddress = 0, firmwareEndAddress = 0;

const FLASH_SIZE = 32768;
const FLASH_PAGE_SIZE = 1024; // 1024
const FLASH_PAGE_NUM = (FLASH_SIZE / FLASH_PAGE_SIZE);

function infoBlockDisplay(tmp) {
	var infoTable = document.getElementById('infoBlock');
	// MCU code
	infoTable.rows[1].cells[1].innerHTML = '0x' + tmp[FLASH_PAGE_SIZE - 6].toString(16);
	// BL type
	if (tmp[FLASH_PAGE_SIZE - 7] == 1) {
		infoTable.rows[2].cells[1].innerHTML = 'UART';
	}
	// Flash page size
	if (tmp[FLASH_PAGE_SIZE - 8] == 2) {
		infoTable.rows[3].cells[1].innerHTML = '1024';
	} else if(tmp[FLASH_PAGE_SIZE - 8] == 1) {
		infoTable.rows[3].cells[1].innerHTML = '512';
	}
	// App FW Version
	var ver_high = tmp[FLASH_PAGE_SIZE - 10].toString();
	var ver_low  = tmp[FLASH_PAGE_SIZE - 9].toString();
	infoTable.rows[4].cells[1].innerHTML = ver_high + '.' + ver_low;
	// Reserved
	infoTable.rows[5].cells[1].innerHTML = '0x' + tmp[FLASH_PAGE_SIZE - 11].toString(16);
	// App Start Addr
	infoTable.rows[6].cells[1].innerHTML = firmwareStartAddress;
	// App End Addr
	infoTable.rows[7].cells[1].innerHTML = firmwareEndAddress;
}

function handleFiles(files) {
	fs.readFile(files[0].name, 'utf8', function(err,data) {
		if (err) throw err;
		hex = hexParse.parse(data);

		var tmp = new Buffer(FLASH_PAGE_SIZE);
		for (i = 0; i < FLASH_PAGE_NUM; i++) {
			if (hex.pageInUse[i] == 1) {
				var addr = i * FLASH_PAGE_SIZE;
				if (firmwareStartAddress === 0) {
					firmwareStartAddress = '0x' + addr.toString(16);
				}
				firmwareEndAddress = '0x' + (addr + FLASH_PAGE_SIZE).toString(16) ;
				hex.data.copy(tmp, 0, addr, addr + FLASH_PAGE_SIZE);
			}
		}
		infoBlockDisplay(tmp);
	});
}

function openFileOption() {
	document.getElementById("openFile").click();
}

