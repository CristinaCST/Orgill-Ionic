export interface NavbarCustomButton{
    identifier?: string;
    action(event: any): any;
    icon: string;
}