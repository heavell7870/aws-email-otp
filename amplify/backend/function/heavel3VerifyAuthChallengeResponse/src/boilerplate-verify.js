exports.handler = async (event, context, callback) => {
  const expectedAnswer =
    event.request.privateChallengeParameters.secretLoginCode;
  if (event.request.challengeAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  callback(null, event);
};
