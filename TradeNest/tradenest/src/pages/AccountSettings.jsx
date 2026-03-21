import React from 'react';

const AccountPage = () => {
  return (
    <div className="account-wrapper">
      <div className="account-grid">
        
        {/* Sidebar */}
        <aside className="account-nav">
          <a href="#profile" className="nav-item">General Profile</a>
          <a href="#bank" className="nav-item active">Bank Account</a>
          <a href="#security" className="nav-item">Security</a>
        </aside>

        {/* Main Content */}
        <main className="settings-card">
          <header>
            <h1 className="card-title">Bank Account Details</h1>
            <p className="card-subtitle">
              Configure your South African banking details to receive automated escrow payouts.
            </p>
          </header>

          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group">
                <label>Bank Name</label>
                <select className="input-control">
                  <option>FNB</option>
                  <option>Standard Bank</option>
                  <option>Capitec</option>
                  <option>Absa</option>
                  <option>Nedbank</option>
                </select>
              </div>

              <div className="input-group">
                <label>Account Type</label>
                <select className="input-control">
                  <option>Savings</option>
                  <option>Cheque</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Account Number</label>
              <input type="text" className="input-control" placeholder="Enter account number" />
            </div>

            <div className="input-group">
              <label>Branch Code (Universal or Specific)</label>
              <input type="text" className="input-control" placeholder="e.g. 250655" />
            </div>

            <button type="submit" className="btn-save">
              Save Banking Information
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AccountPage;