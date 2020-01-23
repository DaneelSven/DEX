/* eslint-disable no-undef */
import { tokens, EVM_REVERT } from './recourse'

const DigitalAsset = artifacts.require('./DigitalAsset');

require('chai')
    .use(require('chai-as-promised'))
    .should();

// contracts parameters are blockchain addresses
contract('DigitalAsset', ([deployer, receiver, exchange]) => {
    const name = 'Digital Asset';
    const symbol = 'DA';
    const decimals = '18';
    const totalSupply = '1000000000000000000000000';
    let token;

    beforeEach(async () => {
        token = await DigitalAsset.new()
    });

    describe('deployment', () => {
        it('tracks the name of the Digital Asset', async () => {
            const result = await token.name();
            result.should.equal(name);
        });

        it('tracks the symbol of the Digital Asset', async ()  => {
            const result = await token.symbol();
            result.should.equal(symbol);
        });

        it('tracks the decimals of the Digital Asset', async ()  => {
            const result = await token.decimals();
            result.toString().should.equal(decimals);
        });

        it('tracks the total supply of the Digital Asset', async ()  => {
            const result = await token.totalSupply();
            result.toString().should.equal(totalSupply);
        });

        it('assigns the total supply to the deployer', async ()  => {
            const result = await token.balanceOfAddress(deployer)
            result.toString().should.equal(totalSupply)
          });
    })

    describe('sending tokens', () => {
        let result
        let amount
    
        describe('success of sending tokens', async () => {
          beforeEach(async () => {
            amount = tokens(100)
            result = await token.transfer(receiver, amount, { from: deployer })
          });
    
          it('transfers token balances', async () => {
            let balanceOfAddress
            balanceOfAddress = await token.balanceOfAddress(deployer)
            balanceOfAddress.toString().should.equal(tokens(999900).toString())
            balanceOfAddress = await token.balanceOfAddress(receiver)
            balanceOfAddress.toString().should.equal(tokens(100).toString())
          });
    
          it('emits a transfer event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Transfer')
            const event = log.args
            event.from.toString().should.equal(deployer, 'from account is correct')
            event.to.should.equal(receiver, 'to account is correct')
            event.value.toString().should.equal(amount.toString(), 'amount of tokens is correct')
          });
    
        });
    
        describe('failure of sending tokens', async () => {
    
          it('rejects insufficient balances', async () => {
            let invalidAmount
            invalidAmount = tokens(100000000) // 100 million - greater than total supply
            await token.transfer(receiver, invalidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT)
    
            // Attempt transfer tokens, when you have none
            invalidAmount = tokens(10) // recipient has no tokens
            await token.transfer(deployer, invalidAmount, { from: receiver }).should.be.rejectedWith(EVM_REVERT)
          });
    
          it('rejects invalid recipients', async () => {
            await token.transfer(0x0, amount, { from: deployer }).should.be.rejected
          });
    
        });
    });

    describe('approving tokens transfers from an external 3rd party for our tokens', () => {
        let result
        let amount
    
        beforeEach(async () => {
          amount = tokens(100)
          result = await token.approve(exchange, amount, { from: deployer })
        })
    
        describe('success', () => {
          it('allocates an allowance for delegated token spending on a exchange', async () => {
            const allowance = await token.allowanceOfTransfer(deployer, exchange)
            allowance.toString().should.equal(amount.toString())
          })
    
    
          it('emits an Approval event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Approval')
            const event = log.args
            event.owner.toString().should.equal(deployer, 'owner is correct')
            event.spender.should.equal(exchange, 'spender is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
          })
    
        })
    
        describe('failure', () => {
          it('rejects invalid spenders', async () => {
            await token.approve(0x0, amount, { from: deployer }).should.be.rejected
          })
        })
      })
    
      describe('delegated token transfers', () => {
        let result
        let amount
    
        beforeEach(async () => {
          amount = tokens(100)
          await token.approve(exchange, amount, { from: deployer })
        })
    
        describe('success', async () => {
          beforeEach(async () => {
            result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
          })
    
          it('transfers token balances', async () => {
            let balanceOf
            balanceOf = await token.balanceOfAddress(deployer)
            balanceOf.toString().should.equal(tokens(999900).toString())
            balanceOf = await token.balanceOfAddress(receiver)
            balanceOf.toString().should.equal(tokens(100).toString())
          })
    
          it('resets the allowance', async () => {
            const allowance = await token.allowanceOfTransfer(deployer, exchange)
            allowance.toString().should.equal('0')
          })
    
          it('emits a Transfer event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Transfer')
            const event = log.args
            event.from.toString().should.equal(deployer, 'from is correct')
            event.to.should.equal(receiver, 'to is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
          })
    
        })
    
        describe('failure', async () => {
          it('rejects insufficient amounts', async () => {
            // Attempt transfer too many tokens
            const invalidAmount = tokens(100000000)
            await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT)
          })
    
          it('rejects invalid recipients', async () => {
            await token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected
          })
        })
      })

      describe('approving tokens from a 3rd party for our tokens', () => {
        let result
        let amount
    
        beforeEach(async () => {
          amount = tokens(100)
          result = await token.approve(exchange, amount, { from: deployer })
        })
    
        describe('success', () => {
          it('allocates an allowance for delegated token spending on exchange', async () => {
            const allowance = await token.allowanceOfTransfer(deployer, exchange)
            allowance.toString().should.equal(amount.toString())
          })
    
    
          it('emits an Approval event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Approval')
            const event = log.args
            event.owner.toString().should.equal(deployer, 'owner is correct')
            event.spender.should.equal(exchange, 'spender is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
          })
    
        })
    
        describe('failure', () => {
          it('rejects invalid spenders', async () => {
            await token.approve(0x0, amount, { from: deployer }).should.be.rejected
          })
        })
      })
    
      describe('delegated token transfers, tokens transfered by another entity that has approval', () => {
        let result
        let amount
    
        beforeEach(async () => {
          amount = tokens(100)
          await token.approve(exchange, amount, { from: deployer })
        })
    
        describe('success', async () => {
          beforeEach(async () => {
            result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
          })
    
          it('transfers token balances', async () => {
            let balanceOf
            balanceOf = await token.balanceOfAddress(deployer)
            balanceOf.toString().should.equal(tokens(999900).toString())
            balanceOf = await token.balanceOfAddress(receiver)
            balanceOf.toString().should.equal(tokens(100).toString())
          })
    
          it('resets the allowance', async () => {
            const allowance = await token.allowanceOfTransfer(deployer, exchange)
            allowance.toString().should.equal('0')
          })
    
          it('emits a Transfer event', async () => {
            const log = result.logs[0]
            log.event.should.eq('Transfer')
            const event = log.args
            event.from.toString().should.equal(deployer, 'from is correct')
            event.to.should.equal(receiver, 'to is correct')
            event.value.toString().should.equal(amount.toString(), 'value is correct')
          })
    
        })
    
        describe('failure', async () => {
          it('rejects insufficient amounts', async () => {
            // Attempt transfer too many tokens
            const invalidAmount = tokens(100000000)
            await token.transferFrom(deployer, receiver, invalidAmount, { from: exchange }).should.be.rejectedWith(EVM_REVERT)
          })
    
          it('rejects invalid recipients', async () => {
            await token.transferFrom(deployer, 0x0, amount, { from: exchange }).should.be.rejected
          })
        })
      })
    
});
