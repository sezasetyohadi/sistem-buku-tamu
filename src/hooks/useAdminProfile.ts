import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProfile } from '../types/admin-profile-types';
import { getAdminData, clearAdminSessionAndRedirect } from '../lib/utils';

export const useAdminProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastModified, setLastModified] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setIsLoading(true);
        
        // Use JWT-based authentication check
        const adminData = await getAdminData();
        if (!adminData) {
          clearAdminSessionAndRedirect(router);
          return undefined;
        }
        
        // Fetch profile data using JWT authentication
        const response = await fetch('/api/admin/profile', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearAdminSessionAndRedirect(router);
            return;
          }
          throw new Error('Failed to fetch admin profile');
        }

        const data = await response.json();
        
        if (data.success) {
          await fetchBidangName(data.admin, adminData);
          setLastModified(data.admin.updated_at || data.admin.created_at);

          // Dispatch event to update layout component
          window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
            detail: { profilePicture: data.admin.profile_picture } 
          }));
        } else {
          await fetchBidangNameFallback(adminData);
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        clearAdminSessionAndRedirect(router);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBidangName = async (adminProfile: any, adminData: any) => {
      try {
        const bidangResponse = await fetch(`/api/admin/bidang?id=${adminProfile.bidang_tujuan_id}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (bidangResponse.ok) {
          const bidangData = await bidangResponse.json();
          if (bidangData.success && bidangData.bidang) {
            setProfile({
              id: adminProfile.id,
              username: adminProfile.username,
              email: adminProfile.email || adminData.email || '',
              nama_lengkap: adminProfile.nama_lengkap || adminData.nama_lengkap || 'Administrator',
              role: bidangData.bidang.bidang,
              created_at: adminProfile.created_at,
              bidang_tujuan_id: adminProfile.bidang_tujuan_id,
              bidang_name: bidangData.bidang.bidang,
              profile_picture: adminProfile.profile_picture
            });
            return;
          }
        }
        
        // Fallback if bidang fetch fails
        setProfile({
          id: adminProfile.id,
          username: adminProfile.username,
          email: adminProfile.email || adminData.email || '',
          nama_lengkap: adminProfile.nama_lengkap || adminData.nama_lengkap || 'Administrator',
          role: 'Admin',
          created_at: adminProfile.created_at,
          bidang_tujuan_id: adminProfile.bidang_tujuan_id,
          profile_picture: adminProfile.profile_picture
        });
      } catch (bidangError) {
        console.error('Error fetching bidang data:', bidangError);
        setProfile({
          id: adminProfile.id,
          username: adminProfile.username,
          email: adminProfile.email || adminData.email || '',
          nama_lengkap: adminProfile.nama_lengkap || adminData.nama_lengkap || 'Administrator',
          role: 'Admin',
          created_at: adminProfile.created_at,
          bidang_tujuan_id: adminProfile.bidang_tujuan_id,
          profile_picture: adminProfile.profile_picture
        });
      }
    };

    const fetchBidangNameFallback = async (adminData: any) => {
      try {
        if (adminData.bidang_tujuan_id) {
          const bidangResponse = await fetch(`/api/admin/bidang?id=${adminData.bidang_tujuan_id}`, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store'
          });
          
          if (bidangResponse.ok) {
            const bidangData = await bidangResponse.json();
            if (bidangData.success && bidangData.bidang) {
              setProfile({
                id: adminData.id,
                username: adminData.username,
                email: adminData.email || '',
                nama_lengkap: adminData.nama_lengkap || 'Administrator',
                role: bidangData.bidang.bidang,
                created_at: adminData.created_at || new Date().toISOString(),
                bidang_tujuan_id: adminData.bidang_tujuan_id,
                bidang_name: bidangData.bidang.bidang,
                profile_picture: adminData.profile_picture || null
              });
              return;
            }
          }
        }
        
        setProfile({
          id: adminData.id,
          username: adminData.username,
          email: adminData.email || '',
          nama_lengkap: adminData.nama_lengkap || 'Administrator',
          role: 'Admin',
          created_at: adminData.created_at || new Date().toISOString(),
          bidang_tujuan_id: adminData.bidang_tujuan_id,
          profile_picture: adminData.profile_picture || null
        });
      } catch (bidangError) {
        console.error('Error fetching bidang data:', bidangError);
        setProfile({
          id: adminData.id,
          username: adminData.username,
          email: adminData.email || '',
          nama_lengkap: adminData.nama_lengkap || 'Administrator',
          role: 'Admin',
          created_at: adminData.created_at || new Date().toISOString(),
          bidang_tujuan_id: adminData.bidang_tujuan_id,
          profile_picture: adminData.profile_picture || null
        });
      }
    };

    fetchAdminProfile();
  }, [router]);

  return {
    profile,
    setProfile,
    isLoading,
    lastModified
  };
};