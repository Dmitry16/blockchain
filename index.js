import SHA256 from 'crypto-js/sha256';

class Block {
	constructor(timeStamp, transactions, prevHash = '') {
		this.timeStamp = timeStamp;
		this.transactions = transactions;
		this.prevHash = prevHash;
		this.nonce = 0;
		this.hash = this.calculateHash();
		this.difficulty = 1;
		this.miningTime = 0;
	}

	calculateHash() {
		return SHA256(this.timeStamp + this.prevHash + this.nonce + JSON.stringify(this.transactions)).toString();
	}

	mineBlock(difficulty) {
		const startTime = Date.now();
		while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
			this.nonce++;
			this.hash = this.calculateHash();
		}
		const finishTime = Date.now();
		console.log('a new Block was mined in ' + ((finishTime - startTime)/600).toFixed(3) + ' sek');
	}
}

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class BlockChain {
	constructor(difficulty) {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = difficulty;
		this.pendingTransactions = [];
		this.miningReward = 100;
	}

	createGenesisBlock() {
		return new Block('30.06.18', {owner:'Dima', amount:'100'}, 0);
	}

	getLastBlock() {
		return this.chain[this.chain.length - 1];
	}
	// addNewBlock(newBlock) {
	// 	newBlock.prevHash = this.getLastBlock().hash;
	// 	newBlock.mineBlock(this.difficulty);
	// 	this.chain.push(newBlock);
	// }
	minePendingTransactions(miningRewardAdress) {
		let block = new Block(Date.now(), this.pendingTransactions);
		block.mineBlock(this.difficulty);

		console.log('block successfully mined!)');
		this.chain.push(block);
		//next we set pending transactions to 0 and send mining reward
		this.pendingTransactions = [
			new Transaction(null, miningRewardAdress, this.miningReward)
		];
	}

	createTransaction(transaction) {
		this.pendingTransactions.push(transaction);
	}

	getBallanceOfAddress(address) {
		let balance = 0;

		for (const block of this.chain) {
			console.log('getBallanceOfAddress::', block.transactions[0]);
			// for (const trans of block.transactions) {
			// 	if (trans.fromAddress === address) {
			// 		balance -= trans.amount;
			// 	}
			// 	if (trans.toAddress === address) {
			// 		balance += trans.amount;
			// 	}
			// }
		}
		return balance;
	}
	isChainValid() {
		for (let i = 1; i < this.chain.length; i ++) {
			let currentBlock = this.chain[i];
			let prevBlock = this.chain[i-1];

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}
			if (prevBlock.hash !== currentBlock.prevHash) {
				return false;
			}
		}
		return true;
	}
}

const difficulty = 2;
const DimasCoin = new BlockChain(difficulty);
DimasCoin.createTransaction('address1', 'address2', 200);
DimasCoin.createTransaction('address2', 'address1', 50);

console.log('\n Starting the miner...');
DimasCoin.minePendingTransactions('dimas-address');
console.log('\n Balance of Dima is ', DimasCoin.getBallanceOfAddress('dimas-address'));
