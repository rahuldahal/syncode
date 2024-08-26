import { TUserBase } from 'src/user/user.type';

export interface TSearchBody {
  username: string;
}

export interface TInvitationBody {
  sender: TUserBase;
  receiver: TUserBase;
  file: {
    id: number;
    name: string;
  };
}

export interface TConfirmationBody extends TInvitationBody {
  senderSocketId: string;
  receiverSocketId: string;
}

export interface TConnectedUsers {
  socketId: string;
  invitationStatus: 'inviter' | 'invitee' | null;
  hasInvited: string | null; // socket ID
  invitedBy: string | null; // socket ID
}

export interface TFileUpdateBody extends TConfirmationBody {
  file: {
    id: number;
    name: string;
    content: string;
  };
}
