const generateProfilePic = (name) => {
  // If no name is provided, return a default avatar with "User"
  if (!name) return "https://ui-avatars.com/api/?name=User&background=random";
  // Extract the first letter of the name and convert it to uppercase
  const firstLetter = name.charAt(0).toUpperCase();
  // Generate the avatar URL with the first letter, random background, and rounded corners
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&rounded=true`;
};

export default generateProfilePic;
