import { TUserBase } from 'src/user/user.type';
import { TConfirmationBody, TInvitationBody } from './event.type';

// HandleDisconnect method
type TDisconnectionResult =
  | 'The inviter is disconnected'
  | 'The invitee is disconnected'
  | 'Connection terminated';

// HandleSearch method
type TUsernameNotProvidedResult = 'Username not provided';

type TUserNotFoundResult = 'User not found';

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
type TReceiverNotConnectedResult = 'The receiver is not connected';
type TAlreadyInConnectionResult = 'Already in a connection';

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

type TEmitMessage =
  | {
      messageName: 'onInvitation';
      messageValue: TDisconnectionResult | TInvitationEmit;
    }
  | { messageName: 'onSearchResult'; messageValue: TSearchResultEmit }
  | { messageName: 'onCollab'; messageValue: TConfirmationEmit }
  | { messageName: 'onFileUpdate'; messageValue: TFileUpdateEmit }
  | null;

export type TEmitInfo = {
  receiver: string | null;
} & TEmitMessage;
