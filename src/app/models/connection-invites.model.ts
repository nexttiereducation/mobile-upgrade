import { IPendingConnection } from '@nte/interfaces/pending-connection.interface';

export class ConnectionInvites {
  constructor(
    public sent: IPendingConnection[] = [],
    public received: IPendingConnection[] = []
  ) { }
}
