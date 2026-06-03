export const whoUnfollowsFromPrevFollowed = `
  SELECT 
    f.username,
    datetime(f.created_at / 1000, 'unixepoch') as created_at 
  FROM followers f
    LEFT JOIN new_followers new ON f.username = new.username
  WHERE new.username IS NULL
    ORDER BY f.ig_from DESC
`;

export const whoUnfollowedMe = `
  SELECT 
    f.username,
    f.ig_from
  FROM followings f
    LEFT JOIN followers fr ON fr.username = f.username
  WHERE fr.username IS NULL
    ORDER BY f.ig_from DESC
`;
