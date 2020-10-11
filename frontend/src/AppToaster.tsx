import { Position, Toaster } from "@blueprintjs/core";

export const AppToaster = Toaster.create({
    className: "recipe-toaster",
    position: Position.TOP,
});

export function showPasswordSavedToast() {
    AppToaster.show({
        message: "Password saved!",
        intent: "success",
        timeout: 2000,
    });
}

export function showPasswordNotSavedToast(error: string) {
    AppToaster.show({
        message: "Password not saved! " + error,
        intent: "danger",
        timeout: 2000,
    });
}
