export interface TSearchBody {
  username: string;
}

export interface TInvitationBody {
  sender: {
    id: number;
    username: string;
  };
  receiver: {
    id: number;
    username: string;
  };
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

export interface TFileUpdateBody {
  id: number;
  content: string;
  senderSocketId: string;
  receiverSocketId: string;
}
