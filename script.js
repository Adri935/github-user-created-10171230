// Helper function to parse data URLs
function parseDataUrl(url) {
  if (!url.startsWith('data:')) return null;
  
  const commaIndex = url.indexOf(',');
  if (commaIndex === -1) return null;
  
  const header = url.substring(5, commaIndex);
  const payload = url.substring(commaIndex + 1);
  
  const parts = header.split(';');
  const mime = parts[0] || 'text/plain';
  const isBase64 = parts.includes('base64');
  
  return { mime, isBase64, payload };
}

// Helper function to decode base64 to text
function decodeBase64ToText(b64) {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error('Failed to decode base64:', e);
    return '';
  }
}

// Helper function to parse CSV
function parseCsv(text) {
  // Remove BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  
  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Detect delimiter
  const delimiters = [',', ';', '\t'];
  let delimiter = ',';
  let maxCount = 0;
  
  for (const delim of delimiters) {
    const count = (text.split('\n')[0] || '').split(delim).length;
    if (count > maxCount) {
      maxCount = count;
      delimiter = delim;
    }
  }
  
  // Parse rows
  const rows = text.split('\n').filter(line => line.length > 0)
    .map(row => {
      // Handle quoted fields
      const regex = new RegExp(`${delimiter}(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))`);
      return row.split(regex).map(field => {
        // Remove surrounding quotes if present
        if (field.startsWith('"') && field.endsWith('"')) {
          return field.substring(1, field.length - 1).replace(/""/g, '"');
        }
        return field;
      });
    });
  
  // Infer header row
  if (rows.length === 0) {
    return { rows: [] };
  }
  
  const firstRow = rows[0];
  const isHeader = firstRow.every(cell => isNaN(Number(cell)));
  
  if (isHeader) {
    return {
      headers: firstRow,
      rows: rows.slice(1)
    };
  }
  
  return { rows };
}

// Format date to YYYY-MM-DD UTC
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Get token from URL parameters
function getTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
}

// Fetch user creation date from GitHub API
async function fetchUserCreationDate(username) {
  const token = getTokenFromUrl();
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-User-Date-Fetcher'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  
  const response = await fetch(`https://api.github.com/users/${username}`, { headers });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    } else if (response.status === 403) {
      throw new Error('Rate limit exceeded. Please try again later or provide a token.');
    } else {
      throw new Error(`API error: ${response.status}`);
    }
  }
  
  const data = await response.json();
  return data.created_at;
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const usernameInput = document.getElementById('github-username');
  const resultContainer = document.getElementById('result-container');
  const resultElement = document.getElementById('github-created-at');
  const form = document.getElementById('github-user-r8s2');
  
  const username = usernameInput.value.trim();
  
  if (!username) {
    resultElement.textContent = 'Please enter a username';
    resultElement.className = 'alert alert-warning';
    resultContainer.classList.add('show');
    return;
  }
  
  // Show loading state
  form.classList.add('loading');
  resultElement.textContent = 'Loading...';
  resultElement.className = 'alert alert-info';
  resultContainer.classList.add('show');
  
  try {
    const createdAt = await fetchUserCreationDate(username);
    const formattedDate = formatDate(createdAt);
    
    resultElement.textContent = formattedDate;
    resultElement.className = 'alert alert-success';
  } catch (error) {
    resultElement.textContent = `Error: ${error.message}`;
    resultElement.className = 'alert alert-error';
  } finally {
    form.classList.remove('loading');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('github-user-r8s2');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});