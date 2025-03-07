const generateProfilePic = (name) => {
  if (!name) return "https://ui-avatars.com/api/?name=User&background=random";
  const firstLetter = name.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&rounded=true`;
};

export default generateProfilePic;
