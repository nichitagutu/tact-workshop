import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Counter } from '../wrappers/Counter';
import '@ton/test-utils';

describe('Counter', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let counterContract: SandboxContract<Counter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        counterContract = blockchain.openContract(await Counter.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await counterContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            },
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: counterContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and counterContract are ready to use
    });

    it('should increase counter', async () => {
        const increaser = await blockchain.treasury('increaser' + 1);

        const counterBefore = await counterContract.getValue();

        console.log('counter before increasing', counterBefore);

        console.log('increasing by', 1);

        const increaseResult = await counterContract.send(
            increaser.getSender(),
            {
                value: toNano('0.05'),
            },
            'increment',
        );

        expect(increaseResult.transactions).toHaveTransaction({
            from: increaser.address,
            to: counterContract.address,
            success: true,
        });

        const counterAfter = await counterContract.getValue();

        console.log('counter after increasing', counterAfter);

        expect(counterAfter).toBe(counterBefore + 1n);
    });

    it('should decrease counter', async () => {
        const decreaser = await blockchain.treasury('decreaser' + 1);

        const counterBefore = await counterContract.getValue();

        console.log('counter before decreasing', counterBefore);

        console.log('decreasing by', 1);

        const decreaseResult = await counterContract.send(
            decreaser.getSender(),
            {
                value: toNano('0.05'),
            },
            // @ts-ignore
            'decrement',
        );

        expect(decreaseResult.transactions).toHaveTransaction({
            from: decreaser.address,
            to: counterContract.address,
            success: true,
        });

        const counterAfter = await counterContract.getValue();

        console.log('counter after decreasing', counterAfter);

        expect(counterAfter).toBe(counterBefore - 1n);
    });
});
