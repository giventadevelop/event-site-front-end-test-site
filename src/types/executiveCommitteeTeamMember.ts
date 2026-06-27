/**
 * DTO for executive committee team member data, matches backend OpenAPI schema.
 */
export interface ExecutiveCommitteeTeamMemberDTO {
  id: number | null;
  tenantId?: string;
  firstName: string;
  lastName: string;
  title: string;
  designation?: string;
  bio?: string;
  email?: string;
  profileImageUrl?: string;
  expertise?: string;
  imageBackground?: string;
  imageStyle?: string;
  department?: string;
  joinDate?: string; // ISO date string
  isActive?: boolean;
  linkedinUrl?: string;
  twitterUrl?: string;
  priorityOrder?: number;
  websiteUrl?: string;
}

/**
 * Form data type for creating/editing executive committee team members
 * Note: expertise is handled as an array in the form for better UX, but converted to string for backend
 */
export interface ExecutiveCommitteeTeamMemberFormData extends Omit<ExecutiveCommitteeTeamMemberDTO, 'id' | 'expertise'> {
  expertise: string[]; // Array of expertise items for form handling
}

