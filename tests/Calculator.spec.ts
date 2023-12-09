import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano } from '@ton/core';
import { Calculator } from '../wrappers/Calculator';
import '@ton/test-utils';

describe('Calculator', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let calculatorContract: SandboxContract<Calculator>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        calculatorContract = blockchain.openContract(await Calculator.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await calculatorContract.send(
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
            to: calculatorContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and calculatorContract are ready to use
    });

    it('should add numbers correctly', async () => {
        for (let i = 0; i < 3; i++) {
            const a = BigInt(Math.floor(Math.random() * 100));
            const b = BigInt(Math.floor(Math.random() * 100));

            console.log(`increase ${i + 1}/${3}\n${a} + ${b} = ${a + b}`);

            const adder = await blockchain.treasury('adder');
            const increaseResult = await calculatorContract.send(
                adder.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'Add',
                    x: a,
                    y: b,
                },
            );

            expect(increaseResult.transactions).toHaveTransaction({
                from: adder.address,
                to: calculatorContract.address,
                success: true,
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: calculatorContract.address,
                to: adder.address,
                success: true,
            });

            const lastTransaction = increaseResult.transactions[increaseResult.transactions.length - 1];

            const lastTransactionBody = lastTransaction.inMessage?.body;

            const resultNumber = parseIntFromBody(lastTransactionBody!);

            expect(resultNumber).toBe(a + b);

            const lastResult = await calculatorContract.getGetLastResult();

            expect(lastResult).toBe(a + b);
        }
    });

    it('should subtract numbers correctly', async () => {
        for (let i = 0; i < 3; i++) {
            const a = BigInt(Math.floor(Math.random() * 100));
            const b = BigInt(Math.floor(Math.random() * 100));

            console.log(`subtract ${i + 1}/${3}\n${a} - ${b} = ${a - b}`);

            const subtracter = await blockchain.treasury('subtracter');
            const increaseResult = await calculatorContract.send(
                subtracter.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    $$type: 'Subtract',
                    x: a,
                    y: b,
                },
            );

            expect(increaseResult.transactions).toHaveTransaction({
                from: subtracter.address,
                to: calculatorContract.address,
                success: true,
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: calculatorContract.address,
                to: subtracter.address,
                success: true,
            });

            const lastTransaction = increaseResult.transactions[increaseResult.transactions.length - 1];

            const lastTransactionBody = lastTransaction.inMessage?.body;

            const resultNumber = parseIntFromBody(lastTransactionBody!);

            expect(resultNumber).toBe(a - b);

            const lastResult = await calculatorContract.getGetLastResult();

            expect(lastResult).toBe(a - b);
        }
    });

    // operation is a > b
    it('should compare numbers correctly', async () => {
        for (let i = 0; i < 3; i++) {
            const a = BigInt(Math.floor(Math.random() * 100));
            const b = BigInt(Math.floor(Math.random() * 100));

            console.log(`greater then ${i + 1}/${3}\n${a} > ${b} is ${a > b}`);

            const comparer = await blockchain.treasury('comparer');
            const increaseResult = await calculatorContract.send(
                comparer.getSender(),
                {
                    value: toNano('0.05'),
                },
                {
                    // @ts-ignore
                    $$type: 'GreaterThen',
                    x: a,
                    y: b,
                },
            );

            expect(increaseResult.transactions).toHaveTransaction({
                from: comparer.address,
                to: calculatorContract.address,
                success: true,
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: calculatorContract.address,
                to: comparer.address,
                success: true,
            });

            const lastTransaction = increaseResult.transactions[increaseResult.transactions.length - 1];

            const lastTransactionBody = lastTransaction.inMessage?.body;

            const resultNumber = parseBoolFromBody(lastTransactionBody!);

            expect(resultNumber).toBe(a > b);
        }
    });
});

function parseBoolFromBody(body: Cell) {
    const bodySlice = body.asSlice();

    bodySlice.loadInt(32);

    return bodySlice.loadBoolean();
}

function parseIntFromBody(body: Cell) {
    const bodySlice = body.asSlice();

    bodySlice.loadInt(32);

    return BigInt(bodySlice.loadInt(32)!);
}
