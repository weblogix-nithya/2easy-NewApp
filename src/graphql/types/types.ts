type UserType = {
  id: number;
  email: string;
};

export default UserType;

export type JoinOnClause = {
  name?: string;
  table_name: string;
  key: string;
  other_table_name: string;
  other_key: string;
  operator?: string;
};