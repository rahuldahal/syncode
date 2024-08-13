import { TUserBase } from 'src/user/user.type';
import { TConfirmationBody, TInvitationBody } from './event.type';

// HandleDisconnect method
interface TDisconnectionResult {
  message:
    | 'The inviter is disconnected'
    | 'The invitee is disconnected'
    | 'Connection terminated';
}

// HandleSearch method
interface TUsernameNotProvidedResult {
  message: 'Username not provided';
}

interface TUserNotFoundResult {
  message: 'User not found';
}

type TSearchResult = TUserBase[];

interface TErrorResult {
  message: 'An error occurred';
  error: string; // Error message
}

type TSearchResultEmit =
  | TUsernameNotProvidedResult
  | TUserNotFoundResult
  | TSearchResult
  | TErrorResult;

// HandleInvitation method
interface TReceiverNotConnectedResult {
  message: 'The receiver is not connected';
}

interface TAlreadyInConnectionResult {
  message: 'Already in a connection';
}

type TInvitationEmit =
  | TReceiverNotConnectedResult
  | TAlreadyInConnectionResult
  | TInvitationBody;

// HandleConfirmation method

type TConfirmationSender = {
  sender: TConfirmationBody['sender'];
  file: TConfirmationBody['file'];
};
type TConfirmationReceiver = {
  receiver: TConfirmationBody['receiver'];
  file: TConfirmationBody['file'];
};

type TConfirmationEmit = TConfirmationSender | TConfirmationReceiver;

// HandleFileUpdate method
interface TFileUpdateSuccess {
  updatedContent: string;
}

interface TFileUpdateError {
  message: 'An error occurred';
  error: string; // Error message
}

type TFileUpdateEmit = TFileUpdateSuccess | TFileUpdateError;

export interface TEmitMessage {
  onInvitation: (payload: TDisconnectionResult | TInvitationEmit) => void;
  onSearchResult: (payload: TSearchResultEmit) => void;
  onCollab: (payload: TConfirmationEmit) => void;
  onFileUpdate: (payload: TFileUpdateEmit) => void;
}
