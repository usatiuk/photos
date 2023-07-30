import { z } from "zod";

export const APIErrorResponse = z.object({
    data: z.null(),
    error: z.string(),
});
export type TAPIErrorResponse = z.infer<typeof APIErrorResponse>;

function CreateAPISuccessResponse<T extends z.ZodTypeAny>(obj: T) {
    return z.object({
        error: z.literal(false),
        data: obj,
    });
}

function CreateAPIResponse<T extends z.ZodTypeAny>(obj: T) {
    return z.union([APIErrorResponse, CreateAPISuccessResponse(obj)]);
}

export const PhotoJSON = z.object({
    id: z.number(),
    user: z.number(),
    hash: z.string(),
    size: z.string(),
    format: z.string(),
    createdAt: z.number(),
    editedAt: z.number(),
    shotAt: z.number(),
    uploaded: z.boolean(),
});
export type TPhotoJSON = z.infer<typeof PhotoJSON>;

export const PhotoReqJSON = PhotoJSON.extend({
    accessToken: z.string(),
});
export type TPhotoReqJSON = z.infer<typeof PhotoReqJSON>;

export const PhotoShowToken = z.string();
export type TPhotoShowToken = z.infer<typeof PhotoShowToken>;

export const PhotosGetShowTokenByIDRespBody = CreateAPIResponse(PhotoShowToken);
export type TPhotosGetShowTokenByIDRespBody = z.infer<
    typeof PhotosGetShowTokenByIDRespBody
>;

export const PhotosNewPostBody = z.object({
    hash: z.string(),
    size: z.string(),
    format: z.string(),
});
export type TPhotosNewPostBody = z.infer<typeof PhotosNewPostBody>;

export const PhotosDeleteBody = z.object({
    photos: z.array(PhotoReqJSON),
});
export type TPhotosDeleteBody = z.infer<typeof PhotosDeleteBody>;

export const PhotosListPagination = 50;

export const PhotosNewRespBody = CreateAPIResponse(PhotoReqJSON);
export type TPhotosNewRespBody = z.infer<typeof PhotosNewRespBody>;

export const PhotosUploadRespBody = CreateAPIResponse(PhotoReqJSON);
export type TPhotosUploadRespBody = z.infer<typeof PhotosUploadRespBody>;

export const PhotosListRespBody = CreateAPIResponse(z.array(PhotoReqJSON));
export type TPhotosListRespBody = z.infer<typeof PhotosListRespBody>;

export const PhotosByIDGetRespBody = CreateAPIResponse(PhotoReqJSON);
export type TPhotosByIDGetRespBody = z.infer<typeof PhotosByIDGetRespBody>;

export const PhotoByIDDeleteRespBody = CreateAPIResponse(z.boolean());
export type TPhotoByIDDeleteRespBody = z.infer<typeof PhotoByIDDeleteRespBody>;

export const PhotosDeleteRespBody = CreateAPIResponse(z.boolean());
export type TPhotosDeleteRespBody = z.infer<typeof PhotosDeleteRespBody>;

export const UserJSON = z.object({
    id: z.number(),
    username: z.string(),
    isAdmin: z.boolean(),
});
export type TUserJSON = z.infer<typeof UserJSON>;

export const UserJWT = UserJSON.extend({
    ext: z.number(),
    iat: z.number(),
});
export type TUserJWT = z.infer<typeof UserJWT>;

export const UserAuthJSON = UserJSON.extend({
    jwt: z.string(),
});
export type TUserAuthJSON = z.infer<typeof UserAuthJSON>;

export const UserSignupBody = z.object({
    username: z.string(),
    password: z.string(),
    email: z.string(),
});
export type TUserSignupBody = z.infer<typeof UserSignupBody>;

export const UserSignupRespBody = CreateAPIResponse(UserAuthJSON);
export type TUserSignupRespBody = z.infer<typeof UserSignupRespBody>;

export const UserGetRespBody = CreateAPIResponse(UserAuthJSON);
export type TUserGetRespBody = z.infer<typeof UserGetRespBody>;

export const UserLoginRespBody = CreateAPIResponse(UserAuthJSON);
export type TUserLoginRespBody = z.infer<typeof UserLoginRespBody>;

export const UserEditBody = z.object({
    password: z.optional(z.string()),
});
export type TUserEditBody = z.infer<typeof UserEditBody>;

export const UserEditRespBody = CreateAPIResponse(UserAuthJSON);
export type TUserEditRespBody = z.infer<typeof UserEditRespBody>;

export const UserLoginBody = z.object({
    username: z.string(),
    password: z.string(),
});
export type TUserLoginBody = z.infer<typeof UserLoginBody>;
