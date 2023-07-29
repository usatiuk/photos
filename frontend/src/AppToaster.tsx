import { Position, Toaster } from "@blueprintjs/core";
import { IPhotoReqJSON } from "./shared/types";

export const AppToaster = Toaster.create({
    className: "recipe-toaster",
    position: Position.TOP,
});

export function showDeletionToast(cancelFn: () => void) {
    AppToaster.show({
        message: "Photo deleted!",
        intent: "danger",
        timeout: 2900,
        action: {
            text: "Undo",
            onClick: cancelFn,
        },
    });
}

export function showPasswordSavedToast(): void {
    AppToaster.show({
        message: "Password saved!",
        intent: "success",
        timeout: 2000,
    });
}

export function showPasswordNotSavedToast(error: string): void {
    AppToaster.show({
        message: "Password not saved! " + error,
        intent: "danger",
        timeout: 2000,
    });
}

export function showPhotoCreateFailToast(f: File, e: string): void {
    AppToaster.show({
        message: `Failed to create ${f.name}: ${e}`,
        intent: "danger",
        timeout: 1000,
    });
}

export function showPhotoUploadJSONFailToast(
    p: IPhotoReqJSON | number,
    e: string,
): void {
    const photoMsg = typeof p === "number" ? p : p.hash;
    AppToaster.show({
        message: `Failed to upload ${photoMsg}: ${e}`,
        intent: "danger",
        timeout: 1000,
    });
}

export function showPhotoUploadFileFailToast(f: File, e: string): void {
    AppToaster.show({
        message: `Failed to upload ${f.name}: ${e}`,
        intent: "danger",
        timeout: 1000,
    });
}
