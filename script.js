   const logBox = document.getElementById('logBox');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const exportBtn = document.getElementById('exportBtn');
    const foundWalletsContainer = document.getElementById('foundWallets');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const scannedCount = document.getElementById('scannedCount');
    const foundCount = document.getElementById('foundCount');
    const speedValue = document.getElementById('speedValue');
    const logContainer = document.getElementById('logContainer');
    const scanAnimation = document.getElementById('scanAnimation');
    const matrixRain = document.getElementById('matrixRain');
    const bootSequence = document.getElementById('bootSequence');
    const mainInterface = document.getElementById('mainInterface');
    const startupSound = document.getElementById('startupSound');
    const typingSound = document.getElementById('typingSound');
    const scanSound = document.getElementById('scanSound');
    const foundSound = document.getElementById('foundSound');

    // State variables
    let scanning = false;
    let scanInterval;
    let foundWallets = [];
    let scanSpeed = 0;
    let lastScanTime = 0;
    let scanStats = {
      totalScanned: 0,
      totalFound: 0,
      scansLastSecond: 0,
      lastSecond: Math.floor(Date.now() / 1000)
    };

    // BIP-39 Wordlist (first 100 words for demo)
    const bip39Words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
      'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
      'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
      'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
      'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
      'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
      'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
      'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest'
    ];

// Initialize Matrix Rain 
function initMatrixRain() {
  const fullName = "WILLIAM SMITH";
  const fontSize = 20;
  const columns = Math.floor(window.innerWidth / fontSize);
  
  // Clear existing matrix rain
  matrixRain.innerHTML = '';
  
  // Create columns
  for (let i = 0; i < columns; i++) {
    const x = i * fontSize;
    const delay = Math.random() * 3;
    
    setTimeout(() => {
      createMatrixColumn(x, fullName);
    }, delay * 1000);
  }
}

function createMatrixColumn(x, fullName) {
  const speed = 3 + Math.random() * 2; // Slower speed for readability
  
  // Create full name element
  setTimeout(() => {
    const nameElement = document.createElement('div');
    nameElement.className = 'matrix-name'; 
    nameElement.textContent = fullName;
    nameElement.style.left = `${x}px`;
    nameElement.style.top = `-50px`;
    nameElement.style.animationDuration = `${speed}s`;
    nameElement.style.color = '#00FFB2';
    nameElement.style.textShadow = '0 0 15px #00FFB2';
    nameElement.style.fontWeight = 'bold';
    matrixRain.appendChild(nameElement);
    
    // Remove after animation completes
    setTimeout(() => {
      if (nameElement.parentNode) {
        nameElement.parentNode.removeChild(nameElement);
      }
    }, speed * 1000);
  }, 0);
  
  // Create new column
  setTimeout(() => {
    createMatrixColumn(x, fullName);
  }, 3000 + Math.random() * 2000); // Longer delay between names
}
    // Generate random wallet phrase
    function generatePhrase() {
      return Array.from({ length: 12 }, () => bip39Words[Math.floor(Math.random() * bip39Words.length)]).join(' ');
    }

    // Play sound with volume control
    function playSound(id, volume = 0.3) {
      const sound = document.getElementById(id);
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Audio play failed:", e));
    }

    // Add log entry with typing effect
    async function logScan(phrase, balance = 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      const div = document.createElement('div');
      div.className = 'log-entry' + (balance > 0 ? ' highlight' : '');
      
      let text = `[${timeStr}] `;
      div.textContent = text;
      logBox.prepend(div);
      
      // Play typing sound
      typingSound.volume = 0.1;
      typingSound.currentTime = 0;
      typingSound.play();
      
      // Type out the phrase
      for (let i = 0; i < phrase.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40));
        text += phrase[i];
        div.textContent = text;
      }
      
      if (balance > 0) {
        const foundText = ` → FOUND: ${balance} BTC`;
        for (let i = 0; i < foundText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 30));
          text += foundText[i];
          div.textContent = text;
        }
      }
      
      typingSound.pause();
      
      // Limit log entries to 100
      if (logBox.children.length > 100) {
        logBox.removeChild(logBox.lastChild);
      }
    }

    // Create wallet card with valid BTC address
    function createWalletCard(wallet) {
      const card = document.createElement('div');
      card.className = 'wallet-card';
      
      // Generate valid BTC address
      const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let address = '1';
      for (let i = 0; i < 33; i++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      card.innerHTML = `
        <div class="wallet-header">
          <i class="fas fa-wallet"></i>
          <span>WALLET FOUND</span>
          <span style="margin-left:auto;font-size:12px;">#${wallet.id.toString().slice(-4)}</span>
        </div>
        <div class="crypto-item">
          <div class="crypto-icon"><i class="fab fa-bitcoin btc-icon"></i></div>
          <div class="crypto-name">BTC:</div>
          <div class="crypto-value">${wallet.btc} ($${wallet.btcVal})</div>
        </div>
        <div class="crypto-item">
          <div class="crypto-icon"><i class="fab fa-bnb bnb-icon"></i></div>
          <div class="crypto-name">BNB:</div>
          <div class="crypto-value">${wallet.bnb} ($${wallet.bnbVal})</div>
        </div>
        <div class="crypto-item">
          <div class="crypto-icon"><i class="fas fa-coins sgl-icon"></i></div>
          <div class="crypto-name">SGL:</div>
          <div class="crypto-value">${wallet.sgl} ($${wallet.sglVal})</div>
        </div>
        <div class="wallet-actions">
          <a href="https://www.blockchain.com/explorer/addresses/btc/${address}" 
             target="_blank" class="explorer-link">
            <i class="fas fa-external-link-alt"></i> View on Explorer
          </a>
        </div>
        <div class="wallet-signature">scanned by WILLIAM SMITH</div>
      `;
      return card;
    }

    // [Rest of your existing functions remain unchanged...]
    // Update found wallets display
    function updateFoundWalletsDisplay() {
      foundWalletsContainer.innerHTML = '';
      foundWallets.forEach(wallet => {
        foundWalletsContainer.appendChild(createWalletCard(wallet));
      });
    }

    // Add a found wallet
    function addFoundWallet() {
      const wallet = {
        id: Date.now(),
        btc: (0.01 + Math.random() * 0.02).toFixed(4),
        bnb: (0.1 + Math.random() * 0.2).toFixed(1),
        sgl: (0.3 + Math.random() * 0.2).toFixed(1)
      };
      
      wallet.btcVal = (1000 + Math.random() * 300).toFixed(2);
      wallet.bnbVal = (100 + Math.random() * 40).toFixed(2);
      wallet.sglVal = (50 + Math.random() * 40).toFixed(2);
      
      foundWallets.unshift(wallet);
      if (foundWallets.length > 4) {
        foundWallets.pop();
      }
      
      scanStats.totalFound++;
      updateStats();
      updateFoundWalletsDisplay();
      playSound('foundSound', 0.2);
      return wallet;
    }

    // Update statistics
    function updateStats() {
      scannedCount.textContent = scanStats.totalScanned;
      foundCount.textContent = scanStats.totalFound;
      speedValue.textContent = `${scanSpeed}/s`;
    }

    // Start scanning
    function startScanning() {
      if (scanning) return;
      
      // Play startup sound
      playSound('startupSound', 0.2);
      
      scanning = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      statusIndicator.classList.add('active');
      statusText.textContent = 'SCANNING';
      logContainer.classList.add('scanning');
      scanAnimation.style.display = 'block';
      foundWallets = [];
      foundWalletsContainer.innerHTML = '';
      scanStats = {
        totalScanned: 0,
        totalFound: 0,
        scansLastSecond: 0,
        lastSecond: Math.floor(Date.now() / 1000)
      };
      updateStats();

      // Speed calculation interval
      const speedInterval = setInterval(() => {
        const currentSecond = Math.floor(Date.now() / 1000);
        if (currentSecond !== scanStats.lastSecond) {
          scanSpeed = scanStats.scansLastSecond;
          scanStats.scansLastSecond = 0;
          scanStats.lastSecond = currentSecond;
          updateStats();
        }
        
        if (!scanning) {
          clearInterval(speedInterval);
        }
      }, 200);

      // Main scanning interval (fast)
      scanInterval = setInterval(() => {
        scanStats.totalScanned++;
        scanStats.scansLastSecond++;
        logScan(generatePhrase());
        updateStats();
        if (Math.random() > 0.7) {
          playSound('scanSound', 0.05);
        }
      }, 50);

      // Slower wallet finding interval (every 5-8 seconds)
      setTimeout(function findWallets() {
        if (!scanning) return;
        
        if (Math.random() < 0.3) { // 30% chance to find
          const walletsToFind = Math.floor(Math.random() * 2) + 1; // 1-2 wallets
          
          for (let i = 0; i < walletsToFind; i++) {
            setTimeout(() => {
              const wallet = addFoundWallet();
              logScan(generatePhrase(), parseFloat(wallet.btc));
            }, i * 800);
          }
        }
        
        setTimeout(findWallets, 5000 + Math.random() * 3000); // Next check in 5-8s
      }, 3000); // Initial delay
    }

    // Stop scanning
    function stopScanning() {
      scanning = false;
      clearInterval(scanInterval);
      startBtn.disabled = false;
      stopBtn.disabled = true;
      statusIndicator.classList.remove('active');
      statusText.textContent = 'OFFLINE';
      logContainer.classList.remove('scanning');
      scanAnimation.style.display = 'none';
      scanSpeed = 0;
      updateStats();
      playSound('startupSound', 0.1);
    }

    // Export found wallets
    function exportWallets() {
      if (foundWallets.length === 0) {
        logScan("No wallets to export");
        return;
      }
      
      const data = JSON.stringify({
        operator: "WILLIAM SMITH",
        timestamp: new Date().toISOString(),
        wallets: foundWallets
      }, null, 2);
      
      const blob = new Blob([data], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crypto_wallets_${new Date().toISOString().slice(0,10)}_WILLIAM_SMITH.json`;
      a.click();
      
      logScan(`Exported ${foundWallets.length} wallet(s)`);
      playSound('scanSound', 0.3);
    }

    // Event listeners
    startBtn.addEventListener('click', startScanning);
    stopBtn.addEventListener('click', stopScanning);
    exportBtn.addEventListener('click', exportWallets);
    stopBtn.disabled = true;

    // Initialize boot sequence
    setTimeout(() => {
      bootSequence.lastElementChild.textContent = "PRESS ENTER TO CONTINUE";
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Enter') {
          document.removeEventListener('keydown', handler);
          playSound('startupSound', 0.3);
          bootSequence.style.opacity = 0;
          setTimeout(() => {
            bootSequence.remove();
            mainInterface.style.display = 'block';
            initMatrixRain();
            
            // Initial logs
            setTimeout(() => {
              for (let i = 0; i < 15; i++) {
                logScan(generatePhrase());
              }
            }, 500);
          }, 500);
        }
      });
    }, 6000);

    // Handle window resize
    window.addEventListener('resize', () => {
      initMatrixRain();
    });
