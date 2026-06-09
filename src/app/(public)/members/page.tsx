'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building, GraduationCap, Search, User } from 'lucide-react';

import { getPublicMembers } from '@/actions/member.actions';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { MemberData } from '@/types';

import styles from './page.module.css';

function formatTier(type: MemberData['type']) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MembersDirectoryPage() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMembers = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getPublicMembers({
        page,
        limit: 12,
        search: search || undefined,
        type: (typeFilter as MemberData['type']) || undefined,
      });

      if (result.success && result.data) {
        setMembers(result.data);
        setTotalPages(result.pagination?.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <span className={styles.kicker}>Verified Directory</span>
            <h1>Meet researchers across the Westbridge network.</h1>
            <p>
              Browse approved member profiles, research areas, and institutional affiliations across our global
              scholarly community.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <Card className={styles.filters} padding="lg">
            <div className={styles.searchWrap}>
              <Search size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, institution, or research area"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className={styles.select}
            >
              <option value="">All tiers</option>
              <option value="student">Student</option>
              <option value="collaborator">Collaborator</option>
              <option value="professional">Professional</option>
              <option value="senior">Senior</option>
              <option value="fellow">Fellow</option>
              <option value="distinguished_fellow">Honorary Fellow</option>
            </select>
          </Card>

          {loading ? (
            <div className={styles.emptyState}>Loading directory...</div>
          ) : members.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>No members found.</strong>
              <span>Try widening the search or removing the current filter.</span>
            </div>
          ) : (
            <div className={styles.grid}>
              {members.map((member) => (
                <Card key={member._id} className={styles.memberCard} padding="lg" hover>
                  <div className={styles.memberHeader}>
                    <div className={styles.avatar}>
                      {member.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.photoUrl} alt={member.fullName} />
                      ) : (
                        <User size={28} />
                      )}
                    </div>
                    <div>
                      <h2>{member.fullName}</h2>
                      <Badge variant={member.type.includes('fellow') ? 'primary' : 'info'} size="sm">
                        {formatTier(member.type)}
                      </Badge>
                    </div>
                  </div>

                  <div className={styles.meta}>
                    <div>
                      <GraduationCap size={16} />
                      <span>{member.designation}</span>
                    </div>
                    <div>
                      <Building size={16} />
                      <span>{member.institution}</span>
                    </div>
                  </div>

                  <div className={styles.tags}>
                    {member.researchAreas.slice(0, 3).map((area) => (
                      <span key={area}>{area}</span>
                    ))}
                    {member.researchAreas.length > 3 && <span>+{member.researchAreas.length - 3}</span>}
                  </div>

                  <Link href={`/members/${member.membershipId}`} className={styles.profileLink}>
                    <Button variant="outline" fullWidth>
                      View Profile
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)}>
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
