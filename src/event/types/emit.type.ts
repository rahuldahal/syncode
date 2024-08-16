import { TUserBase } from 'src/user/user.type';
import { TConfirmationBody, TInvitationBody } from './event.type';
type TError = 'Internal serval error';

// HandleDisconnect method
type TDisconnectionResult =
  | 'The inviter is disconnected'
  | 'The invitee is disconnected'
  | 'Connection terminated';

// HandleSearch method
type TUsernameNotProvidedResult = 'Username not provided';

type TUserNotFoundResult = 'User not found';

type TSearchResult = TUserBase[];

type TSearchResultEmit =
  | TUsernameNotProvidedResult
  | TUserNotFoundResult
  | TSearchResult
  | TError;

// HandleInvitation method
type TReceiverNotConnectedResult = 'The receiver is not connected';
type TAlreadyInConnectionResult = 'Already in a connection';
type TInvalidaData = 'Provided data is invalid';

type TInvitationEmit =
  | TReceiverNotConnectedResult
  | TAlreadyInConnectionResult
  | TInvitationBody
  | TError;

// HandleConfirmation method

type TConfirmationMessage = {
  sender: TConfirmationBody['sender'];
  receiver: TConfirmationBody['receiver'];
  file: TConfirmationBody['file'];
  invitationStatus: 'inviter' | 'invitee';
};

type TConfirmationEmit =
  | TConfirmationMessage
  | TAlreadyInConnectionResult
  | TInvalidaData
  | TError;

// HandleFileUpdate method
type TFileUpdateSuccess = string;

type TFileUpdateEmit = TFileUpdateSuccess | TError;

type TEmitMessage =
  | {
      messageName: 'onInvitation';
      messageValue: TDisconnectionResult | TInvitationEmit;
    }
  | { messageName: 'onSearchResult'; messageValue: TSearchResultEmit }
  | {
      messageName: 'onCollab';
      messageValue: TConfirmationEmit;
    }
  | {
      messageName: 'onFileUpdate';
      messageValue: TFileUpdateEmit;
    }
  | null;

export type TEmitInfo = {
  receiver: string | [string, string] | null;
} & TEmitMessage;
