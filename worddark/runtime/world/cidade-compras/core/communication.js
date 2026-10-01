export function createCommunication({id,channelId,customerId,direction="INBOUND",messages=[]}){
  if(!id||!channelId||!customerId)throw new Error("INVALID_COMMUNICATION");
  return{id,channelId,customerId,direction,messages:[...messages],status:"OPEN",history:[{event:"COMMUNICATION_OPENED",at:new Date().toISOString()}]};
}

export function appendMessage(communication,{id,text,direction="INBOUND",at=new Date().toISOString()}){
  if(!communication||communication.status!=="OPEN"||!id||!text)throw new Error("INVALID_MESSAGE");
  return{...communication,messages:[...communication.messages,{id,text,direction,at}],history:[...communication.history,{event:"MESSAGE_APPENDED",messageId:id,at}]};
}

export function closeCommunication(communication){
  if(!communication)throw new Error("INVALID_COMMUNICATION");
  return{...communication,status:"CLOSED",history:[...communication.history,{event:"COMMUNICATION_CLOSED",at:new Date().toISOString()}]};
}