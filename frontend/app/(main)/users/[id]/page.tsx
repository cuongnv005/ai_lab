"use client";

import { use, useState } from "react";
import { useUserProfile, useUserPosts, useUpdateUserProfile } from "@/features/user-profile/hooks/use-user-profile";
import { AvatarUpload, ProfileInfo, ProfileEditForm, UserPostList } from "@/features/user-profile/components";
import { useAuth } from "@/features/auth";
import { Button, Dialog, DialogContent, DialogTrigger } from "@/bks/ds-system-sdk";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { useTranslations } from "next-intl";

export default function UserProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const userId = params.id;
  
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.id ? String(currentUser.id) === String(userId) : false;

  const { data: profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const [page, setPage] = useState(1);
  const { data: postsData, isLoading: isPostsLoading } = useUserPosts(userId, page);
  const updateMutation = useUpdateUserProfile();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const t = useTranslations("UserProfilePage");

  if (isProfileLoading) {
    return <div className="p-8 text-center animate-pulse">{t('loadingProfile')}</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-red-500">{t('userNotFound')}</div>;
  }

  const handleUpdate = async (data: any) => {
    try {
      // Backend requires name, and expects avatar_url instead of avatar
      const payload = {
        name: profile.name,
        dob: profile.dob || null,
        hometown: profile.hometown || null,
        gender: profile.gender || null,
        bio: profile.bio || null,
        avatar_url: profile.avatar_url || profile.avatar || null,
        ...data
      };
      
      if (data.avatar) {
        payload.avatar_url = data.avatar;
      }
      
      // Remove fields not needed by backend
      delete payload.avatar;
      delete payload.id;
      delete payload.created_at;
      delete payload.gender_label;

      await updateMutation.mutateAsync(payload);
      toast.success(t('updateSuccess'));
      setIsEditModalOpen(false);
      setIsAvatarModalOpen(false);
    } catch (error) {
      toast.error(t('updateError'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 items-start relative bg-card p-6 rounded-xl border shadow-sm">
        {/* Avatar */}
        <div className="shrink-0 flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-md bg-muted">
            <img 
              src={profile.avatar_url || profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.id}`} 
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          {isOwner && (
             <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
               <DialogTrigger render={<Button variant="outline" size="sm" />}>
                 {t('changeAvatar')}
               </DialogTrigger>
               <DialogContent>
                 <div className="p-4">
                   <h3 className="text-lg font-bold mb-4">{t('uploadAvatarTitle')}</h3>
                   <AvatarUpload 
                     value={profile.avatar_url || profile.avatar}
                     onChange={(url) => {
                       if (url) {
                         handleUpdate({ avatar: url });
                       }
                     }}
                     disabled={updateMutation.isPending}
                     isSubmitting={updateMutation.isPending}
                   />
                 </div>
               </DialogContent>
             </Dialog>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 pt-2">
          <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          <p className="text-muted-foreground mb-4">
             {t('joinedFrom', { date: new Date(profile.created_at).toLocaleDateString() })}
          </p>
          
          {isOwner && (
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger render={<Button className="gap-2" />}>
                  <Edit className="w-4 h-4" />
                  {t('editProfile')}
              </DialogTrigger>
              <DialogContent className="max-w-[90%] md:max-w-sm overflow-y-auto max-h-[90vh] p-0 border-0">
                <ProfileEditForm 
                  initialData={profile} 
                  onSubmit={handleUpdate}
                  isSubmitting={updateMutation.isPending}
                  onCancel={() => setIsEditModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProfileInfo user={profile} />
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 px-1">{t('recentPosts')}</h2>
          <UserPostList 
            posts={postsData?.data || []}
            meta={postsData?.meta || { current_page: 1, last_page: 1, total: 0 }}
            isLoading={isPostsLoading}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
