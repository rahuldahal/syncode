import { TUserBase } from 'src/user/user.type';

export interface TSearchBody {
  username: string;
}

// TODO: since Invitation and Confirmation body are same, rename to a more generic name
export interface TCollaborationBody {
  sender: TUserBase;
  receiver: TUserBase;
  file: {
    id: number;
    name: string;
  };
}

export interface TConnectedUsers {
  socketId: string;
  invitationStatus: 'pending' | 'inviter' | 'invitee' | null;
  hasInvited: string | null; // socket ID
  invitedBy: string | null; // socket ID
}

export interface TFileUpdateBody extends TCollaborationBody {
  file: {
    id: number;
    name: string;
    content: string;
  };
}
