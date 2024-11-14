```js
// creating a schema for strings
const MySchema = z.string();

// parsing
MySchema.parse("tuna"); // => "tuna"
MySchema.parse(12); // => throws ZodError

const UserSchema = z.object({
  username: z.string(),
});

UserSchema.parse({ username: "Ludwig" });
UserSchema.parse({ username: 42 }); // ZodError
UserSchema.parse({ userName: "" }); // ZodError
```