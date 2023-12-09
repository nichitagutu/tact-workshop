import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, beginCell, toNano } from '@ton/core';
import { Wallet } from '../wrappers/Wallet';
import '@ton/test-utils';

describe('Wallet', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let walletContract: SandboxContract<Wallet>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        walletContract = blockchain.openContract(await Wallet.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await walletContract.send(
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
            to: walletContract.address,
            deploy: true,
            success: true,
        });

        await walletContract.send(
            deployer.getSender(),
            {
                value: toNano('10'),
            },
            null,
        );
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and walletContract are ready to use
    });

    it('should send money', async () => {
        const receiver = await blockchain.treasury('receiver');
        console.log(deployer.address, receiver.address, walletContract.address);
        const sendResult = await walletContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                // @ts-ignore
                $$type: 'WithdrawTo',
                amount: toNano('0.01'),
                to: receiver.address,
            },
        );

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: walletContract.address,
            success: true,
        });

        expect(sendResult.transactions).toHaveTransaction({
            from: walletContract.address,
            to: receiver.address,
            success: true,
        });
    });

    it('should not allow sending more money then available', async () => {
        const receiver = await blockchain.treasury('receiver');
        const sendResult = await walletContract.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                // @ts-ignore
                $$type: 'WithdrawTo',
                amount: toNano('10000'),
                to: receiver.address,
            },
        );

        expect(sendResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: walletContract.address,
            success: false,
        });
    });
});
