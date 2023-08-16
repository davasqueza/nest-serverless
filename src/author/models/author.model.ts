import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'author ' })
export class Author {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
