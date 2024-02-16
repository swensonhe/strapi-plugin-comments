export default (relatedField: string): any => {
  const regex = /^(api::\w+\.\w+):(\d+)$/;
  const match = relatedField.match(regex);
  if (match) {
    const apiName = match[1];
    const recordID = parseInt(match[2]);
    return { apiName, recordID };
  }
};
