import _d from "./declarations";
// // We need this statement to make sure the decorators are included in the compiled output
const _t = _d;

interface TransferArgs {
    /** The destination to transfer the call to 
        * Number or the extension to transfer the call to
        * For external transfers, usethe full dialable phone number
        * */
    destination: string;
}

interface HangupArgs {
    /** Optional reason for hanging up the call */
    reason: string | undefined;
}

class CallHandling{
  /** Transfer a call to a specified destination */
  @tool
  static async transfer({destination}: TransferArgs) {
    const callSid = meta.vars.metadata.call_sid;
      setTimeout(() => {
          meta.urai.sendCommand(callSid, {
              command: "transfer",
              destination,
          });
      }, 5000);
    return { success: true, status: "transferring" }
  }

/** Hangup a call with an optional reason */
  @tool
  static async hangup({reason}: HangupArgs) {
      const callSid = meta.vars.metadata.call_sid;
      setTimeout(() => {
          meta.urai.sendCommand(callSid, {
              command: "hangup",
              reason
          });
      }, 5000);
    return { success: true, status: "hanging_up" }
  }
}
