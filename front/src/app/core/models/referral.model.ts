export interface SponsoredUser {
  name: string;
  email: string;
  createdAt: string;
}

export interface ReferralDashboard {
  referralCode: string;
  sponsoredUsers: SponsoredUser[];
}