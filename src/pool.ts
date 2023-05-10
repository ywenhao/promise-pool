type IPromise = Promise<boolean>;

export async function pool(promiseList: (() => IPromise)[], limit: number) {
  const poolSet = new Set<IPromise>();

  let i = 0;
  for (const promiseFn of promiseList) {
    if (poolSet.size >= limit) {
      await Promise.race(poolSet).catch((e) => e);
    }

    const promise = promiseFn();

    const cb = (res: any) => {
      poolSet.delete(promise);
      console.log(i, 'cb', res);
    };

    const cb2 = (res: any) => {
      poolSet.delete(promise);
      console.log(i, 'cb2', res);
    };

    promise.then(cb).catch(cb2);
    poolSet.add(promise);
    i++;
  }
}

let a = false;
const mockRequest = () =>
  new Promise<boolean>((resolve, reject) => {
    fetch(
      'https://console-mock.apipost.cn/mock/f233ab29-8e89-4f8d-ab06-c04e42cea621/mock/f233ab29-8e89-4f8d-ab06-c04e42cea621/1'
    ).finally(() => {
      a && resolve(a);
      !a && reject(new Error('error'));
      a = !a;
    });
  });

const promiseList = Array.from({ length: 20 }).map(() => () => mockRequest());

pool(promiseList, 3);
