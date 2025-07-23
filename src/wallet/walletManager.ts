import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

export async function initWallet(): Promise<void> {
    try {
        // Initialize Tezos toolkit
        const tezos = new TezosToolkit('https://mainnet.api.tez.ie');
        
        // Initialize Beacon wallet
        const wallet = new BeaconWallet({
            name: 'Lloryn Promo Website',
            preferredNetwork: 'mainnet'
        });
        
        // Connect wallet
        await wallet.requestPermissions();
        
        // Set wallet provider
        tezos.setWalletProvider(wallet);
        
        // Get user's address
        const userAddress = await wallet.getPKH();
        console.log('Connected wallet address:', userAddress);
        
        // Create connect button
        const connectButton = document.createElement('button');
        connectButton.textContent = 'Connect Wallet';
        connectButton.style.position = 'fixed';
        connectButton.style.bottom = '20px';
        connectButton.style.right = '20px';
        connectButton.style.padding = '10px 20px';
        connectButton.style.backgroundColor = '#4CAF50';
        connectButton.style.color = 'white';
        connectButton.style.border = 'none';
        connectButton.style.borderRadius = '5px';
        connectButton.style.cursor = 'pointer';
        
        connectButton.addEventListener('click', async () => {
            try {
                await wallet.requestPermissions();
                const address = await wallet.getPKH();
                console.log('Wallet connected:', address);
                connectButton.textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        });
        
        document.body.appendChild(connectButton);
    } catch (error) {
        console.error('Error initializing wallet:', error);
    }
} 