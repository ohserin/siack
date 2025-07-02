import { useForm } from 'react-hook-form';
import './styles/Join.css';
function Join() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        if (data.password !== data.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        console.log('회원가입 데이터:', data);
        alert('회원가입 성공!');
    };

    return (
        <div>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>이름:</label>
                    <input {...register('name', { required: true })} />
                    <div>
                        {errors.name && <span>이름을 입력해주세요.</span>}
                    </div>

                </div>

                <div>
                    <label>이메일:</label>
                    <input {...register('email', { required: true })} />
                    <div>
                        {errors.email && <span>이메일을 입력해주세요.</span>}
                    </div>

                </div>

                <div>
                    <label>핸드폰번호:</label>
                    <input {...register('phone', { required: true })} />
                    <div>
                        {errors.phone && <span>핸드폰번호를 입력해주세요.</span>}
                    </div>

                </div>

                <div>
                    <label>아이디:</label>
                    <input {...register('username', { required: true })} />
                    <div>
                        {errors.username && <span>아이디를 입력해주세요.</span>}
                    </div>

                </div>

                <div>
                    <label>비밀번호:</label>
                    <input type="password" {...register('password', { required: true })} />
                    <div>
                        {errors.password && <span>비밀번호를 입력해주세요.</span>}
                    </div>

                </div>

                <div>
                    <label>비밀번호 확인:</label>
                    <input type="password" {...register('confirmPassword', { required: true })} />
                    <div>
                        {errors.confirmPassword && <span>비밀번호 확인을 입력해주세요.</span>}
                    </div>

                </div>

                <button type="submit">회원가입</button>
            </form>
        </div>
    );
}

export default Join;
