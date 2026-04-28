export type InboxClient = 'gmail' | 'apple';

export function OpenEmailChrome({ client, isMobile, subject }: { client: InboxClient; isMobile: boolean; subject: string }) {
  const sub = subject || 'Subject line';

  if (client === 'gmail' && !isMobile) {
    return (
      <div style={{ padding: '20px 24px 0', fontFamily: '"Google Sans", Roboto, system-ui, sans-serif', background: '#fff' }}>
        <div style={{ fontSize: 22, fontWeight: 400, color: '#202124', marginBottom: 14, lineHeight: 1.3 }}>{sub}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EA4335', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>S</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: '#202124' }}>
              <span style={{ fontWeight: 600 }}>Shop</span>
              <span style={{ color: '#5F6368', marginLeft: 4 }}>&lt;noreply@shopify.com&gt;</span>
            </div>
            <div style={{ fontSize: 12, color: '#5F6368' }}>to me <span style={{ fontSize: 11 }}>▾</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12, color: '#5F6368' }}>Apr 27, 2026</span>
            <span style={{ fontSize: 18, color: '#5F6368', cursor: 'default', letterSpacing: 2 }}>⟲ ⋮</span>
          </div>
        </div>
      </div>
    );
  }

  if (client === 'gmail' && isMobile) {
    return (
      <div style={{ padding: '16px 16px 0', fontFamily: '"Google Sans", Roboto, system-ui, sans-serif', background: '#fff' }}>
        <div style={{ fontSize: 18, fontWeight: 400, color: '#202124', marginBottom: 12, lineHeight: 1.3 }}>{sub}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EA4335', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>S</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>Shop</div>
            <div style={{ fontSize: 12, color: '#5F6368' }}>to me</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#5F6368' }}>9:41 AM</span>
            <span style={{ fontSize: 16, color: '#5F6368', cursor: 'default' }}>⋮</span>
          </div>
        </div>
      </div>
    );
  }

  if (client === 'apple' && !isMobile) {
    return (
      <div style={{ padding: '16px 20px', background: '#F5F5F7', borderBottom: '1px solid #D1D1D6', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1C1C1E', marginBottom: 10 }}>{sub}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr', rowGap: 3, fontSize: 13, color: '#1C1C1E' }}>
          <span style={{ color: '#8E8E93', textAlign: 'right', paddingRight: 8 }}>From:</span>
          <span>Shop &lt;noreply@shopify.com&gt;</span>
          <span style={{ color: '#8E8E93', textAlign: 'right', paddingRight: 8 }}>To:</span>
          <span style={{ color: '#007AFF' }}>me</span>
          <span style={{ color: '#8E8E93', textAlign: 'right', paddingRight: 8 }}>Date:</span>
          <span style={{ color: '#8E8E93' }}>Sunday, April 27, 2026 at 9:41 AM</span>
        </div>
      </div>
    );
  }

  // Apple Mail iOS
  return (
    <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #C6C6C8', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>Shop</span>
        <span style={{ fontSize: 13, color: '#8E8E93' }}>9:41 AM</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#000', marginBottom: 2 }}>{sub}</div>
      <div style={{ fontSize: 13, color: '#8E8E93' }}>To: me</div>
    </div>
  );
}

export function GmailRow({ sub, pre }: { sub: string; pre: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EA4335', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>S</div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'baseline' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#202124', whiteSpace: 'nowrap', marginRight: 8 }}>Shop</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0, maxWidth: '40%' }}>{sub}</span>
        <span style={{ fontSize: 14, color: '#5F6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}> — {pre}</span>
      </div>
      <span style={{ fontSize: 12, color: '#5F6368', whiteSpace: 'nowrap', marginLeft: 8 }}>9:41 AM</span>
    </div>
  );
}

export function AppleMailRow({ sub, pre }: { sub: string; pre: string }) {
  return (
    <div style={{ padding: '10px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>S</div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>Shop</span>
            <span style={{ fontSize: 12, color: '#8E8E93' }}>9:41 AM</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
          <div style={{ fontSize: 13, color: '#8E8E93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pre}</div>
        </div>
      </div>
    </div>
  );
}
