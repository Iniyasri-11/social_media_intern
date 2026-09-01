import { CheckCircle, AlertTriangle, XCircle, Users } from 'lucide-react';

export default function CommunityFactCheck({ post }) {
  if (!post) return null;

  const communityVerified = post.community_verified_count || 0;
  const communityDisputed = post.community_disputed_count || 0;
  const totalCommunityReports = communityVerified + communityDisputed;

  return (
    <div className="community-fact-check">
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} />
          Community Verification
        </h4>
        {totalCommunityReports === 0 ? (
          <p style={{ fontSize: '13px', color: '#999' }}>No community reports yet</p>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <CheckCircle size={16} style={{ color: '#4CAF50' }} />
              <span style={{ fontSize: '13px' }}>{communityVerified} verified authentic</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={16} style={{ color: '#FF9800' }} />
              <span style={{ fontSize: '13px' }}>{communityDisputed} flagged as questionable</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
