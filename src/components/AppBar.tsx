interface AppBarComponentProps {
  appbartitle: string;
}

const AppBarComponent: React.FC<AppBarComponentProps> = (props) => {
  return (
    <>
    <div>
      <h2 className="px-5 text-xl py-4">{props.appbartitle}</h2>

    </div>
    </>
  );
};

export default AppBarComponent;
